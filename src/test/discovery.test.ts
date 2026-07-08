import { describe, expect, it } from 'vitest';
import { discoverServer, DiscoveryDeps } from '../discovery';

function deps(
  platform: NodeJS.Platform,
  existing: string[],
): DiscoveryDeps {
  const set = new Set(existing);
  return {
    platform,
    existsSync: (candidate: string) => set.has(candidate),
  };
}

describe('discoverServer', () => {
  it('returns the configured setting path first, trimmed, before anything else', () => {
    const result = discoverServer(
      {
        configuredPath: '  /opt/rextio/rextio-lsp  ',
        workspaceFolders: ['/work/proj'],
      },
      deps('linux', ['/work/proj/.venv/bin/rextio-lsp']),
    );
    expect(result).toEqual({
      command: '/opt/rextio/rextio-lsp',
      source: 'setting',
    });
  });

  it('ignores an empty / whitespace-only setting', () => {
    const result = discoverServer(
      { configuredPath: '   ', workspaceFolders: [] },
      deps('linux', []),
    );
    expect(result.source).toBe('path');
  });

  it('prefers .venv over venv within a folder (POSIX layout)', () => {
    const result = discoverServer(
      { workspaceFolders: ['/work/proj'] },
      deps('darwin', [
        '/work/proj/.venv/bin/rextio-lsp',
        '/work/proj/venv/bin/rextio-lsp',
      ]),
    );
    expect(result).toEqual({
      command: '/work/proj/.venv/bin/rextio-lsp',
      source: 'venv',
    });
  });

  it('falls back to venv when only venv exists', () => {
    const result = discoverServer(
      { workspaceFolders: ['/work/proj'] },
      deps('linux', ['/work/proj/venv/bin/rextio-lsp']),
    );
    expect(result.command).toBe('/work/proj/venv/bin/rextio-lsp');
    expect(result.source).toBe('venv');
  });

  it('searches multiple workspace folders in order', () => {
    const result = discoverServer(
      { workspaceFolders: ['/a', '/b'] },
      deps('linux', ['/b/.venv/bin/rextio-lsp']),
    );
    expect(result.command).toBe('/b/.venv/bin/rextio-lsp');
    expect(result.source).toBe('venv');
  });

  it('uses Scripts\\rextio-lsp.exe layout on Windows', () => {
    const result = discoverServer(
      { workspaceFolders: ['C:\\work\\proj'] },
      deps('win32', ['C:\\work\\proj\\.venv\\Scripts\\rextio-lsp.exe']),
    );
    expect(result).toEqual({
      command: 'C:\\work\\proj\\.venv\\Scripts\\rextio-lsp.exe',
      source: 'venv',
    });
  });

  it('falls back to the bare PATH command when nothing exists on disk', () => {
    const result = discoverServer(
      { workspaceFolders: ['/work/proj'] },
      deps('linux', []),
    );
    expect(result).toEqual({ command: 'rextio-lsp', source: 'path' });
  });

  it('falls back to PATH when there are no workspace folders at all', () => {
    const result = discoverServer(
      { workspaceFolders: [] },
      deps('linux', []),
    );
    expect(result.source).toBe('path');
  });
});
