import { describe, expect, it } from 'vitest';
import { buildInitializationOptions } from '../initialization';

describe('buildInitializationOptions', () => {
  it('maps enabled code lens and a real interpreter path', () => {
    const options = buildInitializationOptions({
      codeLensEnable: true,
      interpreterPath: '/usr/bin/python3',
    });
    expect(options).toEqual({
      codeLens: { enable: true },
      interpreter: { path: '/usr/bin/python3' },
    });
  });

  it('sends interpreter.path as null when the setting is empty', () => {
    const options = buildInitializationOptions({
      codeLensEnable: true,
      interpreterPath: '',
    });
    expect(options.interpreter.path).toBeNull();
  });

  it('treats a whitespace-only interpreter path as unset (null)', () => {
    const options = buildInitializationOptions({
      codeLensEnable: false,
      interpreterPath: '   ',
    });
    expect(options).toEqual({
      codeLens: { enable: false },
      interpreter: { path: null },
    });
  });

  it('trims a surrounding whitespace from a non-empty interpreter path', () => {
    const options = buildInitializationOptions({
      codeLensEnable: true,
      interpreterPath: '  /opt/py/bin/python  ',
    });
    expect(options.interpreter.path).toBe('/opt/py/bin/python');
  });

  it('carries the codeLens.enable flag through when disabled', () => {
    const options = buildInitializationOptions({
      codeLensEnable: false,
      interpreterPath: '/usr/bin/python3',
    });
    expect(options.codeLens.enable).toBe(false);
  });
});
