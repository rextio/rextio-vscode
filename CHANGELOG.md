# Changelog

## Unreleased

### Maintenance

- Added GitHub Actions validation for the thin client: type checking, linting,
  unit tests, production build, and VSIX packaging. It runs for `main` and the
  active `0.1.1` integration branch; the packaged VSIX is retained as a CI
  artifact.

### Server install prompt

- When `rextio-lsp` cannot be started, the client shows **one** actionable
  non-modal notification (`showInformationMessage` with buttons) in addition
  to the existing status-bar warning and output-channel line.
- Adaptive choices: **Install into .venv (Recommended)** when a workspace
  `.venv`/`venv` Python exists; always **Install into system Python (Not
  recommended)** and **Skip**. Skip is remembered in `workspaceState`;
  **Rextio: Restart Server** clears the skip so the prompt can return.
- Install runs via `child_process.spawn` (no shell) under a notification
  progress UI, streams pip output to the Rextio channel, and restarts the
  client on success. Failures surface the channel and keep the warning;
  no `--break-system-packages` overrides.

### Amended notification rule

- **Amendment:** the previous "never a modal popup / no popups on server not
  found" rule is relaxed for this single non-modal install prompt only.
  Other flows (route-info code lens, status bar) remain non-popup.

## 0.1.0 — 2026-07-12

Initial release of the Rextio VS Code extension — a thin client for the
`rextio-lsp` language server (the server is not bundled).

### Server discovery and lifecycle

- Discovers `rextio-lsp` in order: the `rextio.server.path` setting, the
  workspace's `.venv`/`venv` (`Scripts` on Windows), then PATH; launched over
  stdio via `vscode-languageclient` 9.x (engines `^1.82.0`).
- Activates only when the workspace contains a `rextio.toml`. When no server
  executable is found, a status-bar warning plus an output-channel line are
  shown — never a modal popup — and `Rextio: Restart Server` retries.
  *(Superseded for the install prompt only; see Unreleased.)*
- Configuration changes restart the client only for launch-time settings
  (`rextio.enable`, `rextio.server.path`, `rextio.server.args`,
  `rextio.codeLens.enable`, `rextio.interpreter.path`);
  `rextio.trace.server` is applied live without a restart.

### Settings → initializationOptions

- `rextio.codeLens.enable` and `rextio.interpreter.path` are forwarded to
  the server as
  `{ "codeLens": {"enable": …}, "interpreter": {"path": … | null} }`.

### UI

- Status bar item with server state and a live diagnostics summary
  (`Rextio ✓` when clean, `Rextio W:<n> i:<m>` otherwise — counting
  rextio-sourced diagnostics only); click to restart.
- `rextio.showRouteInfo` command backing the server's route code lenses
  (logs to the output channel; hidden from the command palette).
- Diagnostics and hovers flow through LSP untouched — the client does no
  analysis of its own.
