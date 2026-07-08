import * as vscode from 'vscode';
import * as fs from 'fs';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  State,
  TransportKind,
} from 'vscode-languageclient/node';
import { discoverServer } from './discovery';

const RESTART_COMMAND = 'rextio.restartServer';
const CONFIG_SECTION = 'rextio';

let client: LanguageClient | undefined;
let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

type StatusKind = 'starting' | 'running' | 'stopped' | 'disabled' | 'not-found';

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
  );

  // Restart when any rextio.* setting that affects launch changes.
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(CONFIG_SECTION)) {
        void restart();
      }
    }),
  );

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

function setStatus(kind: StatusKind): void {
  switch (kind) {
    case 'starting':
      statusBarItem.text = '$(sync~spin) Rextio';
      statusBarItem.tooltip = 'Rextio: starting language server…';
      break;
    case 'running':
      statusBarItem.text = '$(check) Rextio';
      statusBarItem.tooltip = 'Rextio: language server running (click to restart)';
      break;
    case 'stopped':
      statusBarItem.text = '$(circle-slash) Rextio';
      statusBarItem.tooltip = 'Rextio: language server stopped (click to restart)';
      break;
    case 'disabled':
      statusBarItem.text = '$(circle-slash) Rextio';
      statusBarItem.tooltip = 'Rextio: disabled (rextio.enable is false)';
      break;
    case 'not-found':
      statusBarItem.text = '$(warning) Rextio';
      statusBarItem.tooltip =
        'Rextio: rextio-lsp not found. Install it or set rextio.server.path (click to retry).';
      break;
  }
  statusBarItem.show();
}
