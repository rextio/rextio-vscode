# Rextio

Surfaces Rextio’s native-vs-fallback analysis directly in the editor: which functions go native (or plugin / shim / fallback / Numba), diagnostics with promotion guidance, and a status-bar summary—so you can see route and status while you type without leaving VS Code.

## Release status

This is version **0.1.1**, dated 2026-07-26. The release targets both the
[VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=rextio.rextio-vscode)
and [Open VSX](https://open-vsx.org/) from the same verified VSIX. Registry
availability is confirmed independently after publication.

## Requirements

- A project with a `rextio.toml` at the workspace root (or under a workspace folder). The extension activates only when that file is present.
- Install the analysis stack into the project’s virtual environment:

  ```bash
  pip install rextio rextio-lsp
  ```

  The extension discovers `.venv` and `venv` automatically (and falls back to `PATH`).

- Packages and source:
  - [rextio on PyPI](https://pypi.org/project/rextio/)
  - [rextio-lsp on PyPI](https://pypi.org/project/rextio-lsp/)
  - [rextio on GitHub](https://github.com/rextio/rextio)

The language server is **not** bundled with this extension. Keeping `rextio-lsp` in the project environment keeps analysis in lock-step with the project’s Rextio version and enabled plugins. The extension coexists with Pylance, pyright, and ruff; it does no general Python linting of its own.

## Features

| Feature | What you get |
| --- | --- |
| **Diagnostics** | Rextio findings with `source: "rextio"` and RXT / RXTP codes, plus promotion guidance in the message. |
| **Hover** | Route and status info for analysed functions (native / plugin / shim / fallback / Numba). |
| **Code lenses** | `Rextio: <route>` lenses above analysed functions (toggle with `rextio.codeLens.enable`). |
| **Quick fix** | Apply `@rextio.exempt` when a diagnostic offers that code action. |
| **Status bar** | Left-side **Rextio** item: server state plus a summary of Rextio diagnostics (`W:` warnings, `i:` info/hints). Click to restart. |
| **Server install prompt** | If `rextio-lsp` is missing, a non-modal prompt offers three choices (when applicable): **Install into .venv (Recommended)**, **Install into system Python (Not recommended)**, or **Skip**. |

## Settings

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `rextio.enable` | boolean | `true` | Enable the Rextio language client. |
| `rextio.server.path` | string | `""` | Absolute path to the `rextio-lsp` executable. When empty, the extension discovers it from the workspace virtual environment (`.venv` / `venv`) or from `PATH`. |
| `rextio.server.args` | string[] | `[]` | Additional command-line arguments passed to the rextio-lsp server. |
| `rextio.codeLens.enable` | boolean | `true` | Show Rextio route-info code lenses above analysed functions. Sent to the server as initialization options. |
| `rextio.interpreter.path` | string | `""` | Path to the Python interpreter the server should analyse against. When empty, the server chooses its own interpreter. |
| `rextio.trace.server` | `off` \| `messages` \| `verbose` | `off` | Trace communication between VS Code and the Rextio language server (visible in the output channel). |

Changing a launch-time setting (`rextio.enable`, `rextio.server.path`, `rextio.server.args`, `rextio.codeLens.enable`, or `rextio.interpreter.path`) restarts the language client. Changing `rextio.trace.server` does not restart the client; the trace level is applied live.

## Commands

- **Rextio: Restart Server** — stop and relaunch the language server. Also bound to clicking the status bar item. Clears a remembered **Skip** on the install prompt so the prompt can appear again if the server is still missing.

## Troubleshooting

### Server not found

If the status bar shows a warning and the install prompt appears:

1. Prefer **Install into .venv (Recommended)** when the workspace has a `.venv` or `venv`.
2. Or install yourself: `pip install rextio-lsp` into the project environment, then click the status bar (or run **Rextio: Restart Server**).
3. Or set `rextio.server.path` to the absolute path of your `rextio-lsp` executable (or a Python interpreter plus `rextio.server.args` such as `["-m", "rextio_lsp"]`).

Install progress and pip output stream to the **Rextio** output channel. On failure (for example PEP 668 system Python, or package not yet published), that channel is shown and the status-bar warning remains.

### Where is the Rextio output channel?

**View → Output**, then choose **Rextio** in the dropdown. Use it for discovery logs, install/pip output, LSP trace (`rextio.trace.server`), and route-info notices from code lenses.

## Contributing

Build, test, and packaging instructions live in [DEVELOPMENT.md](https://github.com/rextio/rextio-vscode/blob/main/DEVELOPMENT.md).

## License

MIT
