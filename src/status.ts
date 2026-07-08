/**
 * Pure diagnostics-summary label for the Rextio status bar. Kept free of the
 * VS Code runtime; it accepts plain `{ source, severity }` records so it is
 * unit-testable without the extension host.
 */

/** Numeric values of VS Code's `DiagnosticSeverity` enum. */
const SEVERITY = { Error: 0, Warning: 1, Information: 2, Hint: 3 } as const;

/** Minimal shape of a `vscode.Diagnostic` this module reads. */
export interface DiagnosticLike {
  source?: string;
  severity: number;
}

/** Only diagnostics carrying this `source` are Rextio's. */
const REXTIO_SOURCE = 'rextio';

/**
 * Summarise Rextio-sourced diagnostics for the status bar:
 *   - `Rextio ✓`           when there are none
 *   - `Rextio W:<n> i:<m>`  otherwise, where n = warnings and m = information +
 *     hints. Errors (which Rextio does not emit) fold into the warning count so
 *     nothing is silently dropped from the non-empty signal.
 *
 * `entries` mirrors `vscode.languages.getDiagnostics()`: an array of
 * `[uri, Diagnostic[]]` pairs. Non-Rextio sources are ignored.
 */
export function diagnosticsSummaryLabel(
  entries: ReadonlyArray<readonly [unknown, ReadonlyArray<DiagnosticLike>]>,
): string {
  let warnings = 0;
  let infoHints = 0;
  for (const [, diagnostics] of entries) {
    for (const diagnostic of diagnostics) {
      if (diagnostic.source !== REXTIO_SOURCE) {
        continue;
      }
      if (
        diagnostic.severity === SEVERITY.Information ||
        diagnostic.severity === SEVERITY.Hint
      ) {
        infoHints += 1;
      } else {
        warnings += 1;
      }
    }
  }
  if (warnings + infoHints === 0) {
    return 'Rextio ✓';
  }
  return `Rextio W:${warnings} i:${infoHints}`;
}
