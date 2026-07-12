import { describe, expect, it } from 'vitest';
import {
  buildInstallOptions,
  findWorkspaceVenvPython,
  installChoiceFor,
  installCommandFor,
  INSTALL_SYSTEM_LABEL,
  INSTALL_VENV_LABEL,
  isInstallPromptSkipped,
  setInstallPromptSkipped,
  SKIP_INSTALL_PROMPT_KEY,
  SKIP_LABEL,
  VenvPythonDeps,
} from '../install';

function deps(
  platform: NodeJS.Platform,
  existing: string[],
): VenvPythonDeps {
  const set = new Set(existing);
  return {
    platform,
    existsSync: (candidate: string) => set.has(candidate),
  };
}

describe('buildInstallOptions', () => {
  it('offers venv (recommended), system, and skip when a workspace venv exists', () => {
    expect(buildInstallOptions(true)).toEqual([
      INSTALL_VENV_LABEL,
      INSTALL_SYSTEM_LABEL,
      SKIP_LABEL,
    ]);
  });

  it('omits the venv option when no workspace venv is present', () => {
    expect(buildInstallOptions(false)).toEqual([
      INSTALL_SYSTEM_LABEL,
      SKIP_LABEL,
    ]);
  });
});

describe('installCommandFor', () => {
  it('builds a venv pip install against the given interpreter', () => {
    expect(
      installCommandFor('venv', '/work/proj/.venv/bin/python', 'linux'),
    ).toEqual({
      command: '/work/proj/.venv/bin/python',
      args: ['-m', 'pip', 'install', 'rextio-lsp'],
    });
  });

  it('uses python3 for system install on POSIX', () => {
    expect(installCommandFor('system', null, 'darwin')).toEqual({
      command: 'python3',
      args: ['-m', 'pip', 'install', 'rextio-lsp'],
    });
  });

  it('uses python for system install on Windows', () => {
    expect(installCommandFor('system', null, 'win32')).toEqual({
      command: 'python',
      args: ['-m', 'pip', 'install', 'rextio-lsp'],
    });
  });

  it('builds a Windows venv path command without shell metacharacters', () => {
    expect(
      installCommandFor(
        'venv',
        'C:\\work\\proj\\.venv\\Scripts\\python.exe',
        'win32',
      ),
    ).toEqual({
      command: 'C:\\work\\proj\\.venv\\Scripts\\python.exe',
      args: ['-m', 'pip', 'install', 'rextio-lsp'],
    });
  });

  it('throws when venv target has no python path', () => {
    expect(() => installCommandFor('venv', null, 'linux')).toThrow(
      /venv Python path/,
    );
  });

  it('does not pass break-system-packages or other override flags', () => {
    const { args } = installCommandFor('system', null, 'linux');
    expect(args).not.toContain('--break-system-packages');
    expect(args).toEqual(['-m', 'pip', 'install', 'rextio-lsp']);
  });
});

describe('installChoiceFor', () => {
  it('maps button labels to targets and skip', () => {
    expect(installChoiceFor(INSTALL_VENV_LABEL)).toBe('venv');
    expect(installChoiceFor(INSTALL_SYSTEM_LABEL)).toBe('system');
    expect(installChoiceFor(SKIP_LABEL)).toBe('skip');
    expect(installChoiceFor(undefined)).toBeNull();
    expect(installChoiceFor('something else')).toBeNull();
  });
});

describe('findWorkspaceVenvPython', () => {
  it('prefers .venv over venv within a folder (POSIX bin/python)', () => {
    const result = findWorkspaceVenvPython(
      ['/work/proj'],
      deps('linux', [
        '/work/proj/.venv/bin/python',
        '/work/proj/venv/bin/python',
      ]),
    );
    expect(result).toBe('/work/proj/.venv/bin/python');
  });

  it('falls back to venv when only venv exists', () => {
    const result = findWorkspaceVenvPython(
      ['/work/proj'],
      deps('darwin', ['/work/proj/venv/bin/python']),
    );
    expect(result).toBe('/work/proj/venv/bin/python');
  });

  it('uses Scripts\\python.exe layout on Windows', () => {
    const result = findWorkspaceVenvPython(
      ['C:\\work\\proj'],
      deps('win32', ['C:\\work\\proj\\.venv\\Scripts\\python.exe']),
    );
    expect(result).toBe('C:\\work\\proj\\.venv\\Scripts\\python.exe');
  });

  it('searches multiple workspace folders in order', () => {
    const result = findWorkspaceVenvPython(
      ['/a', '/b'],
      deps('linux', ['/b/.venv/bin/python']),
    );
    expect(result).toBe('/b/.venv/bin/python');
  });

  it('returns null when no venv python exists', () => {
    expect(findWorkspaceVenvPython(['/work/proj'], deps('linux', []))).toBeNull();
  });
});

describe('skip-state helpers', () => {
  it('round-trips remember and clear via an injected store', () => {
    const store = new Map<string, unknown>();
    const get = (key: string) => store.get(key);
    const update = (key: string, value: boolean) => {
      store.set(key, value);
    };

    expect(isInstallPromptSkipped(get)).toBe(false);

    setInstallPromptSkipped(update, true);
    expect(store.get(SKIP_INSTALL_PROMPT_KEY)).toBe(true);
    expect(isInstallPromptSkipped(get)).toBe(true);

    setInstallPromptSkipped(update, false);
    expect(store.get(SKIP_INSTALL_PROMPT_KEY)).toBe(false);
    expect(isInstallPromptSkipped(get)).toBe(false);
  });

  it('treats non-true values as not skipped', () => {
    expect(isInstallPromptSkipped(() => undefined)).toBe(false);
    expect(isInstallPromptSkipped(() => false)).toBe(false);
    expect(isInstallPromptSkipped(() => 'yes')).toBe(false);
  });
});
