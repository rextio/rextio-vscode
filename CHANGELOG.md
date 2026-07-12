# Changelog

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
