import { describe, expect, it } from 'vitest';
import { diagnosticsSummaryLabel, DiagnosticLike } from '../status';

// VS Code DiagnosticSeverity numeric values.
const ERROR = 0;
const WARNING = 1;
const INFORMATION = 2;
const HINT = 3;

function entries(
  ...groups: DiagnosticLike[][]
): Array<readonly [string, DiagnosticLike[]]> {
  return groups.map((diags, i) => [`file://f${i}.py`, diags] as const);
}

describe('diagnosticsSummaryLabel', () => {
  it('shows a check when there are no diagnostics at all', () => {
    expect(diagnosticsSummaryLabel([])).toBe('Rextio ✓');
  });

  it('shows a check when a file has an empty diagnostics list', () => {
    expect(diagnosticsSummaryLabel(entries([]))).toBe('Rextio ✓');
  });

  it('counts warnings and folds information + hints into the info bucket', () => {
    const label = diagnosticsSummaryLabel(
      entries(
        [
          { source: 'rextio', severity: WARNING },
          { source: 'rextio', severity: INFORMATION },
        ],
        [
          { source: 'rextio', severity: HINT },
          { source: 'rextio', severity: WARNING },
        ],
      ),
    );
    expect(label).toBe('Rextio W:2 i:2');
  });

  it('excludes diagnostics from non-Rextio sources', () => {
    const label = diagnosticsSummaryLabel(
      entries([
        { source: 'ruff', severity: WARNING },
        { source: 'Pylance', severity: INFORMATION },
        { severity: WARNING }, // no source at all
        { source: 'rextio', severity: INFORMATION },
      ]),
    );
    expect(label).toBe('Rextio W:0 i:1');
  });

  it('shows a check when the only diagnostics are from other sources', () => {
    const label = diagnosticsSummaryLabel(
      entries([{ source: 'ruff', severity: WARNING }]),
    );
    expect(label).toBe('Rextio ✓');
  });

  it('folds error-severity Rextio diagnostics into the warning count', () => {
    const label = diagnosticsSummaryLabel(
      entries([{ source: 'rextio', severity: ERROR }]),
    );
    expect(label).toBe('Rextio W:1 i:0');
  });
});
