/**
 * Pure builder for the LSP `initializationOptions` payload. Kept free of the
 * VS Code runtime so the settings → options mapping stays unit-testable.
 */

/** The `rextio.*` settings that shape the server's initialization options. */
export interface InitializationSettings {
  /** `rextio.codeLens.enable`. */
  codeLensEnable: boolean;
  /** `rextio.interpreter.path`; an empty (or whitespace-only) value means "unset". */
  interpreterPath: string;
}

/**
 * Fixed contract shared verbatim with the server:
 *   { "codeLens": {"enable": true}, "interpreter": {"path": null} }
 */
export interface InitializationOptions {
  codeLens: { enable: boolean };
  interpreter: { path: string | null };
}

/** Map the relevant settings onto the server's initialization options. */
export function buildInitializationOptions(
  settings: InitializationSettings,
): InitializationOptions {
  const interpreterPath = settings.interpreterPath.trim();
  return {
    codeLens: { enable: settings.codeLensEnable },
    interpreter: { path: interpreterPath.length > 0 ? interpreterPath : null },
  };
}
