# rextio-vscode

**VS Code extension for [Rextio](https://github.com/rextio/rextio) — see what goes native while you type.**

A thin TypeScript client for [`rextio-lsp`](https://github.com/rextio/rextio-lsp). It discovers and launches the LSP server from your project's Python environment (consistent with Rextio's `[toolchain] python` resolution) and renders:

- Route badges per function (native / plugin / shim / fallback / Numba)
- Rextio diagnostics with promotion guidance and quick fixes
- Explicit distinction between "lowered by a Rextio plugin (native Rust)" and "Numba JIT on the Python fallback"

The server is **not** bundled — installing `rextio-lsp` into the project venv keeps analysis in lock-step with the project's Rextio version and enabled plugins. The extension coexists with Pylance/pyright/ruff; it does no general Python linting.

## Status

**Pre-development.** Scaffolded ahead of the Rextio core contract (Phase 0) and `rextio-lsp`.

## License

MIT
