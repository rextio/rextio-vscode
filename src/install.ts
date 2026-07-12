import * as path from 'path';

/**
 * Pure helpers for the "server not found → install" prompt. Kept free of the
 * VS Code runtime so option labels, pip command construction, and skip-state
 * keys stay unit-testable without the extension host.
 */

/** Button offered when a workspace `.venv`/`venv` with a Python is present. */
export const INSTALL_VENV_LABEL = 'Install into .venv (Recommended)';

/** Always offered; installs into the system interpreter (not recommended). */
export const INSTALL_SYSTEM_LABEL =
  'Install into system Python (Not recommended)';

/** Dismisses the prompt and remembers the choice for this workspace. */
export const SKIP_LABEL = 'Skip';

/** workspaceState key: when true, do not re-show the install prompt. */
export const SKIP_INSTALL_PROMPT_KEY = 'rextio.skipInstallPrompt';

/** PyPI package name installed by both install targets. */
export const REXTIO_LSP_PACKAGE = 'rextio-lsp';

export type InstallTarget = 'venv' | 'system';

export interface InstallCommand {
  command: string;
  args: string[];
}

/**
 * Dependencies for locating a workspace venv's Python, injected so tests can
 * exercise Windows vs POSIX layouts without the real filesystem.
 */
export interface VenvPythonDeps {
  existsSync(candidate: string): boolean;
  platform: NodeJS.Platform;
}

/**
 * Ordered button labels for the install prompt.
 * The venv option is only included when a workspace virtualenv was detected.
 */
export function buildInstallOptions(hasWorkspaceVenv: boolean): string[] {
  const options: string[] = [];
  if (hasWorkspaceVenv) {
    options.push(INSTALL_VENV_LABEL);
  }
  options.push(INSTALL_SYSTEM_LABEL, SKIP_LABEL);
  return options;
}

/**
 * Build the argv for `pip install rextio-lsp` against the chosen target.
 * - `venv`: uses the given absolute venv Python path.
 * - `system`: `python3` on POSIX, `python` on Windows.
 * Never adds override flags such as `--break-system-packages`.
 */
export function installCommandFor(
  target: InstallTarget,
  venvPython: string | null,
  platform: NodeJS.Platform,
): InstallCommand {
  const args = ['-m', 'pip', 'install', REXTIO_LSP_PACKAGE];
  if (target === 'venv') {
    if (venvPython === null || venvPython.length === 0) {
      throw new Error('venv install requires a workspace venv Python path');
    }
    return { command: venvPython, args };
  }
  return {
    command: platform === 'win32' ? 'python' : 'python3',
    args,
  };
}

/**
 * Map a chosen button label to an install target, skip, or null (dismissed /
 * unknown).
 */
export function installChoiceFor(
  label: string | undefined,
): InstallTarget | 'skip' | null {
  if (label === INSTALL_VENV_LABEL) {
    return 'venv';
  }
  if (label === INSTALL_SYSTEM_LABEL) {
    return 'system';
  }
  if (label === SKIP_LABEL) {
    return 'skip';
  }
  return null;
}

/**
 * Find the first workspace-folder Python inside `.venv` or `venv`
 * (`.venv` preferred per folder; POSIX `bin/python`, Windows `Scripts\python.exe`).
 * Returns null when none exists on disk.
 */
export function findWorkspaceVenvPython(
  workspaceFolders: string[],
  deps: VenvPythonDeps,
): string | null {
  const isWindows = deps.platform === 'win32';
  const p = isWindows ? path.win32 : path.posix;
  const binDir = isWindows ? 'Scripts' : 'bin';
  const pythonName = isWindows ? 'python.exe' : 'python';

  for (const folder of workspaceFolders) {
    for (const venvDir of ['.venv', 'venv']) {
      const candidate = p.join(folder, venvDir, binDir, pythonName);
      if (deps.existsSync(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

/** Read whether the install prompt was skipped for this workspace. */
export function isInstallPromptSkipped(
  get: (key: string) => unknown,
): boolean {
  return get(SKIP_INSTALL_PROMPT_KEY) === true;
}

/**
 * Remember or clear the workspace skip flag. Pass `true` to skip future prompts;
 * pass `false` (or call with false after `Rextio: Restart Server`) to opt back in.
 */
export function setInstallPromptSkipped(
  update: (key: string, value: boolean) => void | Thenable<void>,
  skipped: boolean,
): void | Thenable<void> {
  return update(SKIP_INSTALL_PROMPT_KEY, skipped);
}
