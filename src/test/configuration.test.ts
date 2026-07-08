import { describe, expect, it } from 'vitest';
import { RESTART_SETTINGS, shouldRestartForChange } from '../configuration';

/**
 * Build an `affectsConfiguration`-style predicate. Like VS Code, a query is
 * "affected" when a changed key equals it, is a parent of it, or is a child of
 * it — so a broad `rextio` change also affects `rextio.server.path`.
 */
function affecting(...changed: string[]): (section: string) => boolean {
  return (section) =>
    changed.some(
      (name) =>
        name === section ||
        section.startsWith(`${name}.`) ||
        name.startsWith(`${section}.`),
    );
}

describe('shouldRestartForChange', () => {
  for (const setting of RESTART_SETTINGS) {
    it(`restarts when ${setting} changes`, () => {
      expect(shouldRestartForChange(affecting(setting))).toBe(true);
    });
  }

  it('does not restart when only rextio.trace.server changes', () => {
    expect(shouldRestartForChange(affecting('rextio.trace.server'))).toBe(false);
  });

  it('does not restart when nothing relevant changed', () => {
    expect(shouldRestartForChange(() => false)).toBe(false);
  });

  it('restarts when a broad rextio section change covers a launch setting', () => {
    // `affectsConfiguration('rextio.server.path')` is true when the whole
    // `rextio` section is reported as affected.
    expect(shouldRestartForChange(affecting('rextio'))).toBe(true);
  });
});
