# rextio-vscode

**VS Code extension for [Rextio](https://github.com/rextio/rextio) — see what goes native while you type.**

A thin TypeScript client for [`rextio-lsp`](https://github.com/rextio/rextio-lsp). It discovers and launches the LSP server from your project's Python environment (consistent with Rextio's `[toolchain] python` resolution) and surfaces:

- Route info per function (native / plugin / shim / fallback / Numba) via hover
- Rextio diagnostics (`source: "rextio"`, RXT/RXTP codes) with promotion guidance
- Explicit distinction between "lowered by a Rextio plugin (native Rust)" and "Numba JIT on the Python fallback"

The server is **not** bundled — installing `rextio-lsp` into the project environment keeps analysis in lock-step with the project's Rextio version and enabled plugins. The extension does no analysis of its own and coexists with Pylance/pyright/ruff; it does no general Python linting.

## Activation

The extension activates only when a workspace contains a `rextio.toml` file. It then discovers the `rextio-lsp` executable in this order:

1. The `rextio.server.path` setting, if set.
2. A workspace virtual environment: `.venv/bin/rextio-lsp` then `venv/bin/rextio-lsp` under each workspace folder (on Windows, `Scripts\rextio-lsp.exe`).
3. `rextio-lsp` on your `PATH`.

If none launches, the **Rextio** status bar item shows a warning, a note is written to the *Rextio* output channel, and a single non-modal notification offers to install the server (see [Server not found](#server-not-found) below). Click the status bar item (or run **Rextio: Restart Server**) to retry after installing manually.

### Server not found

When `rextio-lsp` cannot be started, the extension shows one actionable information message:

> The rextio-lsp language server was not found.

Buttons (adaptive):

| Choice | When shown | What it does |
| --- | --- | --- |
| **Install into .venv (Recommended)** | Only if the workspace has a `.venv` or `venv` with a Python interpreter | Runs `<venv-python> -m pip install rextio-lsp` and restarts the client on success |
| **Install into system Python (Not recommended)** | Always | Runs `python3 -m pip install rextio-lsp` (`python` on Windows) |
| **Skip** | Always | Dismisses and remembers the choice for this workspace so the prompt does not reappear until you run **Rextio: Restart Server** |

Install progress uses a notification progress indicator; pip stdout/stderr is streamed to the *Rextio* output channel. On failure (for example the package is not yet on PyPI, or the system interpreter refuses installs under PEP 668), the output channel is shown and the status-bar warning remains — the extension never passes `--break-system-packages` or similar overrides.

The server package installs from [PyPI](https://pypi.org/) as `rextio-lsp` once published. Until then, install from a local checkout or set `rextio.server.path` (see [Pointing at a development server](#pointing-at-a-development-server)).

## Status bar

The **Rextio** status bar item (left, click to restart) shows the server state as an icon and, while the server is running, a summary of Rextio-sourced diagnostics (`source: "rextio"`) across the workspace:

| State | Item | Meaning |
| --- | --- | --- |
| Starting | `$(sync~spin) Rextio` | Launching the language server. |
| Running, no diagnostics | `$(check) Rextio ✓` | Server up; no Rextio diagnostics. |
| Running, with diagnostics | `$(check) Rextio W:2 i:1` | `W` = warnings, `i` = information + hints. |
| Stopped / disabled | `$(circle-slash) Rextio` | Server stopped, or `rextio.enable` is false. |
| Not found | `$(warning) Rextio` | `rextio-lsp` could not be launched. |

## Settings

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `rextio.enable` | boolean | `true` | Enable the Rextio language client. |
| `rextio.server.path` | string | `""` | Absolute path to the `rextio-lsp` executable. Overrides discovery. |
| `rextio.server.args` | string[] | `[]` | Extra arguments passed to `rextio-lsp`. |
| `rextio.trace.server` | `off` \| `messages` \| `verbose` | `off` | Trace LSP traffic to the output channel. |
| `rextio.codeLens.enable` | boolean | `true` | Show route-info code lenses above analysed functions. Sent to the server. |
| `rextio.interpreter.path` | string | `""` | Python interpreter the server should analyse against. Empty ⇒ `null` (server chooses). |

Changing a launch-time setting — `rextio.enable`, `rextio.server.path`, `rextio.server.args`, `rextio.codeLens.enable`, or `rextio.interpreter.path` — restarts the language client so the change (including the initialization options below) takes effect. Changing `rextio.trace.server` does **not** restart the client; the trace level is applied live.

### Initialization options

At startup the client sends the server a fixed-shape `initializationOptions`, derived from the settings above:

```json
{ "codeLens": { "enable": true }, "interpreter": { "path": null } }
```

`codeLens.enable` mirrors `rextio.codeLens.enable`; `interpreter.path` is `rextio.interpreter.path` trimmed, or `null` when empty.

## Commands

- **Rextio: Restart Server** (`rextio.restartServer`) — stop and relaunch the language server. Also bound to clicking the status bar item. Clears a remembered **Skip** on the install prompt so the prompt can appear again if the server is still missing.
- `rextio.showRouteInfo` — invoked by the server's route-info code lens with a function's qualified name. Writes `Route info requested for <qualname>` to the *Rextio* output channel and updates the status bar tooltip (no popup). Hidden from the command palette. Richer UI arrives in a later milestone.

## Development

Requires Node.js 18+.

```bash
npm install         # install dependencies
npm run build       # production esbuild bundle -> dist/extension.js
npm run watch       # incremental rebuild during development
npm run check-types # tsc --noEmit
npm run lint        # eslint (flat config, typescript-eslint)
npm test            # vitest unit tests (pure discovery logic)
```

Press <kbd>F5</kbd> in VS Code to launch an Extension Development Host with the extension loaded.

### Pointing at a development server

To test against a `rextio-lsp` checkout instead of an installed executable, set `rextio.server.path` (workspace settings) to your dev entry point, for example:

```jsonc
{
  "rextio.server.path": "/path/to/rextio-lsp/.venv/bin/rextio-lsp"
}
```

or point `rextio.server.path` at your Python interpreter and pass the module via `rextio.server.args` (e.g. `["-m", "rextio_lsp"]`). Set `rextio.trace.server` to `verbose` to see the LSP message log.

### Packaging

```bash
npx @vscode/vsce package   # produces rextio-vscode-<version>.vsix (local smoke check)
```

## License

MIT
