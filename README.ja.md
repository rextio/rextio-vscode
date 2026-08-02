# Rextio for VS Code

<p align="center"><img src="./assets/readme/rextio-icon.png" width="112" alt="Rextio プロジェクトアイコン"></p>
<p align="center"><strong>Python の編集中に native route、fallback 理由、Rextio promotion ガイダンスを確認できます。</strong></p>
<p align="center"><a href="https://marketplace.visualstudio.com/items?itemName=rextio.rextio-vscode"><img src="https://img.shields.io/badge/VS_Code_Marketplace-v0.1.1-007ACC" alt="VS Code Marketplace の Rextio 0.1.1"></a> <a href="https://open-vsx.org/extension/rextio/rextio-vscode"><img src="https://img.shields.io/open-vsx/v/rextio/rextio-vscode?label=Open%20VSX" alt="Open VSX の Rextio"></a></p>
<p align="center"><a href="./README.md">English</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.zh-hans.md">简体中文</a> · <a href="./README.zh-hant.md">繁體中文</a> · <strong>日本語</strong></p>

これは [`rextio-lsp`](https://github.com/rextio/rextio-lsp) の薄い VS Code client です。project environment から language server を起動し、diagnostic、hover、CodeLens、quick fix、status を表示します。自身では Python を分析・compile せず server も bundle しません。Rextio が分析/compile、`rextio-lsp` が tooling contract → LSP、本 extension が discovery/UI を担当します。

## インストールして結果を見る

1. [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=rextio.rextio-vscode) または [Open VSX](https://open-vsx.org/extension/rextio/rextio-vscode) から 0.1.1 を導入します。

   ```bash
   code --install-extension rextio.rextio-vscode
   ```

2. project virtual environment に分析 stack を導入します。

   ```bash
   python -m pip install rextio rextio-lsp
   ```

3. `rextio.toml` を含む workspace で Python file を開きます。

Extension は `.venv`/`venv` の `rextio-lsp` を stdio で起動します。`source: "rextio"` diagnostic と、`Rextio: native-direct`、`native-plugin:<id>`、`native-shim`、`fallback-python`、`fallback-accelerated:numba` などの hover/CodeLens route が見えます。

## 機能

| 機能 | Editor の動作 |
| --- | --- |
| Diagnostic/hover | RXT/RXTP finding、route、blocker、advisory、suggestion |
| CodeLens | 関数上の `Rextio: <route>`；設定可能 |
| Quick fix | server が安全性を証明した時に `@rextio.exempt` を適用 |
| Status bar | server 状態と `W:<n> i:<n>` summary；click で restart |
| Install prompt | server 不在時に `.venv`、system Python、skip |

Client は diagnostic を再解釈しません。Pylance/pyright、ruff と共存し、一般 completion、type checking、formatting、linting は行いません。

## 構成

```text
VS Code extension (discovery + UI) → rextio-lsp (contract → LSP) → Rextio + plugins (analysis/build)
```

`rextio.toml` がある workspace のみ activate。探索順は `rextio.server.path`、workspace `.venv`/`venv` executable（Windows は `Scripts\\rextio-lsp.exe`）、`PATH`。失敗時は status bar warning と **Rextio** output を残します。Non-modal prompt は workspace venv 優先で `--break-system-packages` を使わず、**Skip** は **Rextio: Restart Server** まで記憶します。

## 設定

| Setting | Default | 用途 |
| --- | --- | --- |
| `rextio.enable` | `true` | language client 起動 |
| `rextio.server.path` | `""` | server executable；空なら探索 |
| `rextio.server.args` | `[]` | server 追加引数 |
| `rextio.codeLens.enable` | `true` | route CodeLens |
| `rextio.interpreter.path` | `""` | server に渡す Python；空なら `null` |
| `rextio.trace.server` | `off` | `off`、`messages`、`verbose` |

Launch-time setting は client を restart しますが trace は live 適用です。Module 起動では Python を `rextio.server.path`、`rextio.server.args` を `["-m", "rextio_lsp"]` にします。

## Command と troubleshooting

- **Rextio: Restart Server** または status item click は再起動し install skip を解除します。
- **View → Output → Rextio** で discovery、pip、trace、route notice を確認します。
- server 不在時は **Install into .venv (Recommended)**、または `python -m pip install rextio-lsp` 後に restart します。

## 互換性

| Component | 契約 |
| --- | --- |
| Extension / ID | `0.1.1`（2026-07-26）/ `rextio.rextio-vscode` |
| VS Code / client | engine `^1.82.0` / `vscode-languageclient ^9.0.1` |
| Server | external `rextio-lsp`、bundle なし |
| Activation | `workspaceContains:rextio.toml` |
| Distribution | 同じ verified VSIX を Marketplace/Open VSX 向けに使用 |

## 開発

Node.js 20.19+ が必要です。

```bash
npm install
npm run check-types
npm run lint
npm test
npm run build
npm run package
```

詳細は [DEVELOPMENT.md](https://github.com/rextio/rextio-vscode/blob/main/DEVELOPMENT.md) を参照してください。

## ライセンス

[MIT](LICENSE)
