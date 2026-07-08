import * as vscode from 'vscode';
import * as fs from 'fs';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  State,
  TransportKind,
} from 'vscode-languageclient/node';
import { shouldRestartForChange } from './configuration';
import { discoverServer } from './discovery';
import { buildInitializationOptions } from './initialization';
import { diagnosticsSummaryLabel } from './status';

const RESTART_COMMAND = 'rextio.restartServer';
const SHOW_ROUTE_INFO_COMMAND = 'rextio.showRouteInfo';
const CONFIG_SECTION = 'rextio';

let client: LanguageClient | undefined;
let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

type StatusKind = 'starting' | 'running' | 'stopped' | 'disabled' | 'not-found';

/** Latest server state; combined with the diagnostics label in the status bar. */
let serverStatus: StatusKind = 'starting';
/** Latest diagnostics summary (e.g. `Rextio ✓`), shown while the server runs. */
let diagnosticsLabel = 'Rextio ✓';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  outputChannel = vscode.window.createOutputChannel('Rextio');
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  );
  statusBarItem.command = RESTART_COMMAND;
  context.subscriptions.push(outputChannel, statusBarItem);

  context.subscriptions.push(
    vscode.commands.registerCommand(RESTART_COMMAND, () => restart()),
    vscode.commands.registerCommand(
      SHOW_ROUTE_INFO_COMMAND,
      (qualname: string) => showRouteInfo(qualname),
    ),
  );

  // Restart only when a launch-time setting changes (server.path/args, enable,
  // and the initialization options plumbed into the client — codeLens.enable,
  // interpreter.path). `rextio.trace.server` is applied live by the client, so
  // toggling it must not restart and drop server caches.
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (shouldRestartForChange((section) => event.affectsConfiguration(section))) {
        void restart();
      }
    }),
  );

  // Keep the status bar's diagnostics summary in step with the workspace.
  context.subscriptions.push(
    vscode.languages.onDidChangeDiagnostics(() => updateDiagnosticsSummary()),
  );
  updateDiagnosticsSummary();

  await start();
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}

async function start(): Promise<void> {
  const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

  if (!config.get<boolean>('enable', true)) {
    setStatus('disabled');
    outputChannel.appendLine('Rextio is disabled via the "rextio.enable" setting.');
    return;
  }

  const server = discoverServer(
    {
      configuredPath: config.get<string>('server.path'),
      workspaceFolders: (vscode.workspace.workspaceFolders ?? []).map(
        (folder) => folder.uri.fsPath,
      ),
    },
    { existsSync: fs.existsSync, platform: process.platform },
  );

  const args = config.get<string[]>('server.args', []);
  outputChannel.appendLine(
    `Launching rextio-lsp (${server.source}): ${server.command} ${args.join(' ')}`.trimEnd(),
  );

  const serverOptions: ServerOptions = {
    run: { command: server.command, args, transport: TransportKind.stdio },
    debug: { command: server.command, args, transport: TransportKind.stdio },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'python' }],
    outputChannel,
    initializationOptions: buildInitializationOptions({
      codeLensEnable: config.get<boolean>('codeLens.enable', true),
      interpreterPath: config.get<string>('interpreter.path', ''),
    }),
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher('**/rextio.toml'),
    },
  };

  // The second arg ("rextio") makes the client honour `rextio.trace.server`.
  client = new LanguageClient('rextio', 'Rextio', serverOptions, clientOptions);

  client.onDidChangeState((event) => {
    switch (event.newState) {
      case State.Starting:
        setStatus('starting');
        break;
      case State.Running:
        setStatus('running');
        break;
      case State.Stopped:
        setStatus('stopped');
        break;
    }
  });

  setStatus('starting');
  try {
    await client.start();
  } catch (error) {
    // Spawn failure (e.g. server not installed). Single unobtrusive notice via
    // the status bar + output log — no modal popups. Retry via restart command.
    const message = error instanceof Error ? error.message : String(error);
    outputChannel.appendLine(
      `Could not start rextio-lsp: ${message}\n` +
        'Install rextio-lsp into the project environment, or set "rextio.server.path". ' +
        'Click the Rextio status bar item to retry.',
    );
    setStatus('not-found');
  }
}

async function restart(): Promise<void> {
  if (client) {
    try {
      await client.stop();
    } catch {
      // Ignore stop errors (e.g. client was never running).
    }
    client = undefined;
  }
  await start();
}

/**
 * Code-lens action invoked by the server with a route's qualified name. Surfaces
 * a quiet notice — an output-channel line plus a status-bar tooltip — rather
 * than a modal popup. Richer UI arrives in a later milestone.
 */
function showRouteInfo(qualname: string): void {
  const name = typeof qualname === 'string' && qualname.length > 0 ? qualname : '<unknown>';
  const message = `Route info requested for ${name}`;
  outputChannel.appendLine(message);
  statusBarItem.tooltip = `Rextio: ${message}`;
}

/** Recompute the diagnostics summary label and repaint the status bar. */
function updateDiagnosticsSummary(): void {
  diagnosticsLabel = diagnosticsSummaryLabel(vscode.languages.getDiagnostics());
  renderStatusBar();
}

function setStatus(kind: StatusKind): void {
  serverStatus = kind;
  renderStatusBar();
}

/**
 * Repaint the status bar from the current server state and diagnostics summary.
 * The server-state icon is always shown; the diagnostics label is only shown
 * while the server is running (otherwise the state message is what matters).
 */
function renderStatusBar(): void {
  const label = serverStatus === 'running' ? diagnosticsLabel : 'Rextio';
  statusBarItem.text = `${statusIcon(serverStatus)} ${label}`;
  statusBarItem.tooltip = statusTooltip(serverStatus);
  statusBarItem.show();
}

function statusIcon(kind: StatusKind): string {
  switch (kind) {
    case 'starting':
      return '$(sync~spin)';
    case 'running':
      return '$(check)';
    case 'stopped':
    case 'disabled':
      return '$(circle-slash)';
    case 'not-found':
      return '$(warning)';
  }
}

function statusTooltip(kind: StatusKind): string {
  switch (kind) {
    case 'starting':
      return 'Rextio: starting language server…';
    case 'running':
      return 'Rextio: language server running (click to restart)';
    case 'stopped':
      return 'Rextio: language server stopped (click to restart)';
    case 'disabled':
      return 'Rextio: disabled (rextio.enable is false)';
    case 'not-found':
      return 'Rextio: rextio-lsp not found. Install it or set rextio.server.path (click to retry).';
  }
}
