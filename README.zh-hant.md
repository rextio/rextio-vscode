# Rextio for VS Code

<p align="center"><img src="./assets/readme/rextio-icon.png" width="112" alt="Rextio 專案圖示"></p>
<p align="center"><strong>編輯 Python 時查看 native 路由、fallback 原因與 Rextio promotion 指引。</strong></p>
<p align="center"><a href="https://marketplace.visualstudio.com/items?itemName=rextio.rextio-vscode"><img src="https://img.shields.io/badge/VS_Code_Marketplace-v0.1.1-007ACC" alt="VS Code Marketplace 上的 Rextio 0.1.1"></a> <a href="https://open-vsx.org/extension/rextio/rextio-vscode"><img src="https://img.shields.io/open-vsx/v/rextio/rextio-vscode?label=Open%20VSX" alt="Open VSX 上的 Rextio"></a></p>
<p align="center"><a href="./README.md">English</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.zh-hans.md">简体中文</a> · <strong>繁體中文</strong> · <a href="./README.ja.md">日本語</a></p>

這是 [`rextio-lsp`](https://github.com/rextio/rextio-lsp) 的薄 VS Code client。它從專案環境啟動 language server，在 VS Code 顯示 diagnostic、hover、CodeLens、quick fix 與狀態。它不自行分析或編譯 Python，也不綁入 server：Rextio 負責分析/編譯，`rextio-lsp` 把 tooling contract 轉成 LSP，本 extension 負責探索與 UI。

## 安裝並看到結果

1. 從 [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=rextio.rextio-vscode) 或 [Open VSX](https://open-vsx.org/extension/rextio/rextio-vscode) 安裝 0.1.1。

   ```bash
   code --install-extension rextio.rextio-vscode
   ```

2. 在專案 virtual environment 安裝分析 stack。

   ```bash
   python -m pip install rextio rextio-lsp
   ```

3. 開啟含 `rextio.toml` 的 workspace，再開啟 Python 檔案。

Extension 從 `.venv`/`venv` 找到並以 stdio 啟動 `rextio-lsp`。你會看到 `source: "rextio"` diagnostic，以及 `Rextio: native-direct`、`native-plugin:<id>`、`native-shim`、`fallback-python`、`fallback-accelerated:numba` 等 hover/CodeLens 路由。

## 功能

| 功能 | 編輯器行為 |
| --- | --- |
| Diagnostic/hover | RXT/RXTP finding、route、blocker、advisory、suggestion |
| CodeLens | 函式上方 `Rextio: <route>`；可設定 |
| Quick fix | server 證明安全時套用 `@rextio.exempt` |
| Status bar | server 狀態與 `W:<n> i:<n>` 摘要；點擊重啟 |
| Install prompt | server 缺少時安裝至 `.venv`、system Python 或 skip |

Client 不重新解讀診斷。它與 Pylance/pyright、ruff 共存，不做通用 completion、type checking、formatting 或 linting。

## 元件關係

```text
VS Code extension (discovery + UI) → rextio-lsp (contract → LSP) → Rextio + plugins (analysis/build)
```

只在含 `rextio.toml` 的 workspace activate。探索順序是 `rextio.server.path`、workspace `.venv`/`venv` executable（Windows 為 `Scripts\\rextio-lsp.exe`）、`PATH`。失敗時保留 status bar warning 並寫入 **Rextio** output。Non-modal prompt 優先 workspace venv，絕不加 `--break-system-packages`；**Skip** 記到執行 **Rextio: Restart Server** 為止。

## 設定

| 設定 | 預設 | 用途 |
| --- | --- | --- |
| `rextio.enable` | `true` | 啟動 language client |
| `rextio.server.path` | `""` | server executable；空值自動探索 |
| `rextio.server.args` | `[]` | server 額外參數 |
| `rextio.codeLens.enable` | `true` | route CodeLens |
| `rextio.interpreter.path` | `""` | 傳給 server 的 Python；空值為 `null` |
| `rextio.trace.server` | `off` | `off`、`messages`、`verbose` |

Launch-time 設定會重啟 client；trace 即時套用。Module 啟動可把 Python 設為 `rextio.server.path`，並把 `rextio.server.args` 設為 `["-m", "rextio_lsp"]`。

## 指令與排錯

- **Rextio: Restart Server** 或點擊 status item 會重啟並清除 install skip。
- 在 **View → Output → Rextio** 查看 discovery、pip、trace、route notice。
- server 缺少時優先 **Install into .venv (Recommended)**，或執行 `python -m pip install rextio-lsp` 後重啟。

## 相容性

| 元件 | 契約 |
| --- | --- |
| Extension / ID | `0.1.1`（2026-07-26）/ `rextio.rextio-vscode` |
| VS Code / client | engine `^1.82.0` / `vscode-languageclient ^9.0.1` |
| Server | 外部 `rextio-lsp`，不綁入 |
| Activation | `workspaceContains:rextio.toml` |
| 發布 | 同一 verified VSIX 面向 Marketplace 與 Open VSX |

## 開發

需要 Node.js 20.19+。

```bash
npm install
npm run check-types
npm run lint
npm test
npm run build
npm run package
```

詳見 [DEVELOPMENT.md](https://github.com/rextio/rextio-vscode/blob/main/DEVELOPMENT.md)。

## 授權

[MIT](LICENSE)
