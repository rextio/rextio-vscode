# Rextio for VS Code

<p align="center"><img src="./assets/readme/rextio-icon.png" width="112" alt="Rextio 项目图标"></p>
<p align="center"><strong>编辑 Python 时查看 native 路由、fallback 原因和 Rextio promotion 指引。</strong></p>
<p align="center"><a href="https://marketplace.visualstudio.com/items?itemName=rextio.rextio-vscode"><img src="https://img.shields.io/badge/VS_Code_Marketplace-v0.1.1-007ACC" alt="VS Code Marketplace 上的 Rextio 0.1.1"></a> <a href="https://open-vsx.org/extension/rextio/rextio-vscode"><img src="https://img.shields.io/open-vsx/v/rextio/rextio-vscode?label=Open%20VSX" alt="Open VSX 上的 Rextio"></a></p>
<p align="center"><a href="./README.md">English</a> · <a href="./README.ko.md">한국어</a> · <strong>简体中文</strong> · <a href="./README.zh-hant.md">繁體中文</a> · <a href="./README.ja.md">日本語</a></p>

这是 [`rextio-lsp`](https://github.com/rextio/rextio-lsp) 的薄 VS Code client。它从项目环境启动 language server，在 VS Code 中展示 diagnostic、hover、CodeLens、quick fix 和状态。它不自行分析或编译 Python，也不捆绑 server：Rextio 负责分析/编译，`rextio-lsp` 把 tooling contract 转成 LSP，本扩展负责发现与 UI。

## 安装并看到结果

1. 从 [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=rextio.rextio-vscode) 或 [Open VSX](https://open-vsx.org/extension/rextio/rextio-vscode) 安装 0.1.1。

   ```bash
   code --install-extension rextio.rextio-vscode
   ```

2. 在项目 virtual environment 安装分析栈。

   ```bash
   python -m pip install rextio rextio-lsp
   ```

3. 打开包含 `rextio.toml` 的 workspace，再打开 Python 文件。

扩展从 `.venv`/`venv` 发现并以 stdio 启动 `rextio-lsp`。你会看到 `source: "rextio"` diagnostic，以及 `Rextio: native-direct`、`native-plugin:<id>`、`native-shim`、`fallback-python`、`fallback-accelerated:numba` 等 hover/CodeLens 路由。

## 功能

| 功能 | 编辑器行为 |
| --- | --- |
| Diagnostic/hover | RXT/RXTP finding、route、blocker、advisory、suggestion |
| CodeLens | 函数上方 `Rextio: <route>`；可配置 |
| Quick fix | server 证明安全时应用 `@rextio.exempt` |
| Status bar | server 状态与 `W:<n> i:<n>` 汇总；点击重启 |
| Install prompt | server 缺失时安装到 `.venv`、system Python 或 skip |

Client 不重新解释诊断。它与 Pylance/pyright、ruff 共存，不做通用 completion、type checking、formatting 或 linting。

## 组件关系

```text
VS Code extension (discovery + UI) → rextio-lsp (contract → LSP) → Rextio + plugins (analysis/build)
```

仅在含 `rextio.toml` 的 workspace activate。发现顺序是 `rextio.server.path`、workspace `.venv`/`venv` executable（Windows 为 `Scripts\\rextio-lsp.exe`）、`PATH`。失败时保留 status bar warning 并写入 **Rextio** output。Non-modal prompt 优先 workspace venv，永不加 `--break-system-packages`；**Skip** 记到运行 **Rextio: Restart Server** 为止。

## 设置

| 设置 | 默认 | 用途 |
| --- | --- | --- |
| `rextio.enable` | `true` | 启动 language client |
| `rextio.server.path` | `""` | server executable；空值自动发现 |
| `rextio.server.args` | `[]` | server 额外参数 |
| `rextio.codeLens.enable` | `true` | route CodeLens |
| `rextio.interpreter.path` | `""` | 传给 server 的 Python；空值为 `null` |
| `rextio.trace.server` | `off` | `off`、`messages`、`verbose` |

Launch-time 设置会重启 client；trace 实时应用。模块启动可把 Python 设为 `rextio.server.path`，并把 `rextio.server.args` 设为 `["-m", "rextio_lsp"]`。

## 命令与排错

- **Rextio: Restart Server** 或点击 status item 会重启并清除 install skip。
- 在 **View → Output → Rextio** 查看 discovery、pip、trace、route notice。
- server 缺失时优先 **Install into .venv (Recommended)**，或运行 `python -m pip install rextio-lsp` 后重启。

## 兼容性

| 组件 | 契约 |
| --- | --- |
| 扩展 / ID | `0.1.1`（2026-07-26）/ `rextio.rextio-vscode` |
| VS Code / client | engine `^1.82.0` / `vscode-languageclient ^9.0.1` |
| Server | 外部 `rextio-lsp`，不捆绑 |
| Activation | `workspaceContains:rextio.toml` |
| 分发 | 同一 verified VSIX 面向 Marketplace 与 Open VSX |

## 开发

需要 Node.js 20.19+。

```bash
npm install
npm run check-types
npm run lint
npm test
npm run build
npm run package
```

详情见 [DEVELOPMENT.md](https://github.com/rextio/rextio-vscode/blob/main/DEVELOPMENT.md)。

## 许可证

[MIT](LICENSE)
