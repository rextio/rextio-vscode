# Rextio for VS Code

<p align="center"><img src="./assets/readme/rextio-icon.png" width="112" alt="Rextio project icon"></p>
<p align="center"><strong>See native routes, fallback reasons, and Rextio promotion guidance while you edit Python.</strong></p>
<p align="center"><a href="https://marketplace.visualstudio.com/items?itemName=rextio.rextio-vscode"><img src="https://img.shields.io/badge/VS_Code_Marketplace-v0.1.1-007ACC" alt="Rextio 0.1.1 on the VS Code Marketplace"></a> <a href="https://open-vsx.org/extension/rextio/rextio-vscode"><img src="https://img.shields.io/open-vsx/v/rextio/rextio-vscode?label=Open%20VSX" alt="Rextio on Open VSX"></a> <a href="https://github.com/rextio/rextio-vscode/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a></p>
<p align="center"><strong>English</strong> · <a href="./README.ko.md">한국어</a> · <a href="./README.zh-hans.md">简体中文</a> · <a href="./README.zh-hant.md">繁體中文</a> · <a href="./README.ja.md">日本語</a></p>

This extension is the thin VS Code client for [`rextio-lsp`](https://github.com/rextio/rextio-lsp). It launches the language server from your project environment and presents its diagnostics, hovers, CodeLens, quick fixes, and status in VS Code.

It does **not** analyze or compile Python itself, and it does not bundle the server. Rextio owns analysis and compilation; `rextio-lsp` translates Rextio's tooling contract into editor features; this extension handles discovery and UI.

## Install and see it work

1. Install version 0.1.1 from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=rextio.rextio-vscode) or [Open VSX](https://open-vsx.org/extension/rextio/rextio-vscode).

   ```bash
   code --install-extension rextio.rextio-vscode
   ```

2. Install the analysis stack in your project's virtual environment:

   ```bash
   python -m pip install rextio rextio-lsp
   ```

3. Open a workspace containing `rextio.toml`, then open a Python file.

The extension discovers `.venv` or `venv`, starts `rextio-lsp` over stdio, and shows Rextio findings with `source: "rextio"`. Hover an analyzed function or look above it for a route such as `Rextio: native-direct`, `native-plugin:<id>`, `native-shim`, `fallback-python`, or `fallback-accelerated:numba`.

## What you get

| Feature | Editor behavior |
| --- | --- |
| Diagnostics | RXT/RXTP findings and promotion guidance from `rextio-lsp` |
| Hover | Route, native status, blockers, advisories, and suggestions |
| CodeLens | `Rextio: <route>` above analyzed functions; configurable |
| Quick fix | Apply `@rextio.exempt` when the server proves that edit safe |
| Status bar | Server state and `W:<n> i:<n>` summary for Rextio diagnostics; click to restart |
| Install prompt | If the server is missing: install into `.venv`, install into system Python, or skip |

Rextio diagnostics are not duplicated or reinterpreted by the client. The extension coexists with Pylance/pyright and ruff and does no general Python completion, type checking, formatting, or linting.

## How the pieces fit

```text
VS Code extension (discovery + UI)
        ↓ stdio
rextio-lsp (tooling-contract → LSP)
        ↓ in-process or project subprocess
Rextio + enabled plugins (analysis / optional native build)
```

Activation is limited to workspaces containing `rextio.toml`. Server discovery order is:

1. explicit `rextio.server.path`;
2. `.venv/bin/rextio-lsp` or `venv/bin/rextio-lsp` in a workspace folder (`Scripts\\rextio-lsp.exe` on Windows);
3. `rextio-lsp` on `PATH`.

If launch fails, the status bar stays in a warning state and the **Rextio** output channel records the error. The non-modal install prompt prefers a detected workspace virtual environment. It never adds `--break-system-packages`; **Skip** is remembered until **Rextio: Restart Server** is run.

## Settings

| Setting | Default | Purpose |
| --- | --- | --- |
| `rextio.enable` | `true` | Start the language client |
| `rextio.server.path` | `""` | Absolute server executable; empty enables discovery |
| `rextio.server.args` | `[]` | Extra arguments passed to the server |
| `rextio.codeLens.enable` | `true` | Show route CodeLens; forwarded in initialization options |
| `rextio.interpreter.path` | `""` | Project Python interpreter forwarded to the server; empty becomes `null` |
| `rextio.trace.server` | `off` | LSP trace: `off`, `messages`, or `verbose` |

Changing a launch-time setting restarts the client. `rextio.trace.server` applies live without a restart.

To run the server as a Python module, point `rextio.server.path` at the project Python and set:

```jsonc
{
  "rextio.server.path": "/path/to/project/.venv/bin/python",
  "rextio.server.args": ["-m", "rextio_lsp"]
}
```

## Commands and troubleshooting

- **Rextio: Restart Server** stops and relaunches the client and clears a remembered install-prompt skip.
- Click the left-side Rextio status item for the same restart action.
- Open **View → Output → Rextio** for discovery, pip install output, LSP trace, and route-info notices.
- If the server is missing, prefer **Install into .venv (Recommended)** or install it manually with `python -m pip install rextio-lsp`, then restart.

## Compatibility

| Component | Contract |
| --- | --- |
| Extension | `0.1.1`, released 2026-07-26 |
| Identifier | `rextio.rextio-vscode` |
| VS Code engine | `^1.82.0` |
| Language client | `vscode-languageclient` `^9.0.1` |
| Server | external `rextio-lsp`; not bundled |
| Activation | `workspaceContains:rextio.toml` |
| Distribution | same verified VSIX targets VS Code Marketplace and Open VSX |

## Development

Requires Node.js 20.19+.

```bash
npm install
npm run check-types
npm run lint
npm test
npm run build
npm run package
```

See [DEVELOPMENT.md](https://github.com/rextio/rextio-vscode/blob/main/DEVELOPMENT.md) for extension-host and packaging details.

## License

[MIT](LICENSE)
