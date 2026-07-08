import * as path from 'path';

/** Bare executable name of the Rextio language server. */
const EXE = 'rextio-lsp';

/** Where the discovered command came from, for logging / status. */
export type DiscoverySource = 'setting' | 'venv' | 'path';

export interface DiscoveredServer {
  /** Command to spawn (absolute path for `setting`/`venv`, bare name for `path`). */
  command: string;
  source: DiscoverySource;
}

export interface DiscoveryOptions {
  /** Value of the `rextio.server.path` setting (may be empty/undefined). */
  configuredPath?: string;
  /** Absolute filesystem paths of the open workspace folders. */
  workspaceFolders: string[];
}

/**
 * Dependencies injected so this function stays pure and unit-testable without
 * touching the real filesystem or the host platform.
 */
export interface DiscoveryDeps {
  existsSync(candidate: string): boolean;
  platform: NodeJS.Platform;
}

/**
 * Resolve the rextio-lsp command to launch. Order:
 *   (a) `rextio.server.path` setting, if set — trusted as-is.
 *   (b) `<folder>/.venv/bin/rextio-lsp` then `<folder>/venv/bin/rextio-lsp`
 *       (on Windows: `Scripts\rextio-lsp.exe`) for each workspace folder,
 *       returning the first that exists on disk.
 *   (c) bare `rextio-lsp`, deferring existence to spawn (PATH lookup).
 *
 * Always returns a command; a failed spawn of the `path` fallback is what
 * signals "server not installed" to the caller.
 */
export function discoverServer(
  options: DiscoveryOptions,
  deps: DiscoveryDeps,
): DiscoveredServer {
  const configured = options.configuredPath?.trim();
  if (configured) {
    return { command: configured, source: 'setting' };
  }

  const isWindows = deps.platform === 'win32';
  // Use the platform-specific path flavour so tests can exercise Windows
  // resolution from a POSIX host (and vice versa).
  const p = isWindows ? path.win32 : path.posix;
  const binDir = isWindows ? 'Scripts' : 'bin';
  const exeName = isWindows ? `${EXE}.exe` : EXE;

  for (const folder of options.workspaceFolders) {
    for (const venvDir of ['.venv', 'venv']) {
      const candidate = p.join(folder, venvDir, binDir, exeName);
      if (deps.existsSync(candidate)) {
        return { command: candidate, source: 'venv' };
      }
    }
  }

  return { command: EXE, source: 'path' };
}
