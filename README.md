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

If none launches, the **Rextio** status bar item shows a warning and a note is written to the *Rextio* output channel — no popups. Click the status bar item (or run **Rextio: Restart Server**) to retry after installing the server.

## Settings

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `rextio.enable` | boolean | `true` | Enable the Rextio language client. |
| `rextio.server.path` | string | `""` | Absolute path to the `rextio-lsp` executable. Overrides discovery. |
| `rextio.server.args` | string[] | `[]` | Extra arguments passed to `rextio-lsp`. |
| `rextio.trace.server` | `off` \| `messages` \| `verbose` | `off` | Trace LSP traffic to the output channel. |

## Commands

- **Rextio: Restart Server** (`rextio.restartServer`) — stop and relaunch the language server. Also bound to clicking the status bar item.

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
