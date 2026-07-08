/**
 * Pure decision for whether a configuration change warrants restarting the
 * language client. Kept free of the VS Code runtime so the rule stays
 * unit-testable without the extension host.
 */

/**
 * The `rextio.*` settings that only take effect at launch. Changing any of them
 * means the running server must be relaunched:
 *   - `rextio.enable`          — whether the client runs at all.
 *   - `rextio.server.path`     — which executable is launched.
 *   - `rextio.server.args`     — the arguments it is launched with.
 *   - `rextio.codeLens.enable` — plumbed into the launch `initializationOptions`.
 *   - `rextio.interpreter.path`— likewise plumbed into `initializationOptions`.
 *
 * `rextio.trace.server` is deliberately absent: vscode-languageclient applies
 * the trace level live (via the "rextio" client id), so a trace toggle must not
 * drop server caches by restarting.
 */
export const RESTART_SETTINGS = [
  'rextio.enable',
  'rextio.server.path',
  'rextio.server.args',
  'rextio.codeLens.enable',
  'rextio.interpreter.path',
] as const;

/**
 * Decide whether a configuration change should restart the language client.
 *
 * `affects` mirrors `vscode.ConfigurationChangeEvent.affectsConfiguration`: it
 * reports whether the change touched a given settings section. We restart only
 * when a launch-time setting is affected; a `rextio.trace.server`-only change
 * returns `false` because languageclient handles it live.
 */
export function shouldRestartForChange(
  affects: (section: string) => boolean,
): boolean {
  return RESTART_SETTINGS.some((section) => affects(section));
}
