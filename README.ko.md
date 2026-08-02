# VS Code용 Rextio

<p align="center"><img src="./assets/readme/rextio-icon.png" width="112" alt="Rextio 프로젝트 아이콘"></p>
<p align="center"><strong>Python을 편집하면서 네이티브 경로, fallback 이유, Rextio 승격 안내를 확인하세요.</strong></p>
<p align="center"><a href="https://marketplace.visualstudio.com/items?itemName=rextio.rextio-vscode"><img src="https://img.shields.io/badge/VS_Code_Marketplace-v0.1.1-007ACC" alt="VS Code Marketplace의 Rextio 0.1.1"></a> <a href="https://open-vsx.org/extension/rextio/rextio-vscode"><img src="https://img.shields.io/open-vsx/v/rextio/rextio-vscode?label=Open%20VSX" alt="Open VSX의 Rextio"></a></p>
<p align="center"><a href="./README.md">English</a> · <strong>한국어</strong> · <a href="./README.zh-hans.md">简体中文</a> · <a href="./README.zh-hant.md">繁體中文</a> · <a href="./README.ja.md">日本語</a></p>

이 확장은 [`rextio-lsp`](https://github.com/rextio/rextio-lsp)의 얇은 VS Code client입니다. 프로젝트 환경의 language server를 실행하고 diagnostic, hover, CodeLens, quick fix, status를 VS Code에 표시합니다. 자체 분석/compile을 하지 않고 서버도 bundle하지 않습니다. Rextio가 분석과 compile을, `rextio-lsp`가 tooling contract의 LSP 변환을, 이 확장이 검색과 UI를 담당합니다.

## 설치와 첫 결과

1. [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=rextio.rextio-vscode) 또는 [Open VSX](https://open-vsx.org/extension/rextio/rextio-vscode)에서 0.1.1을 설치합니다.

   ```bash
   code --install-extension rextio.rextio-vscode
   ```

2. 프로젝트 virtual environment에 분석 stack을 설치합니다.

   ```bash
   python -m pip install rextio rextio-lsp
   ```

3. `rextio.toml`이 있는 workspace에서 Python 파일을 엽니다.

확장은 `.venv`/`venv`에서 `rextio-lsp`를 찾아 stdio로 실행합니다. `source: "rextio"` diagnostic과 `Rextio: native-direct`, `native-plugin:<id>`, `native-shim`, `fallback-python`, `fallback-accelerated:numba` 같은 route를 hover/CodeLens에서 볼 수 있습니다.

## 제공 기능

| 기능 | 편집기 동작 |
| --- | --- |
| Diagnostic/hover | RXT/RXTP finding, route, blocker, advisory, suggestion |
| CodeLens | 분석된 함수 위의 `Rextio: <route>`; 설정 가능 |
| Quick fix | 서버가 안전을 증명할 때 `@rextio.exempt` 적용 |
| Status bar | 서버 상태와 `W:<n> i:<n>` 요약; 클릭하면 재시작 |
| Install prompt | 서버가 없으면 `.venv` 설치, system Python 설치, skip |

Client는 진단을 재해석하지 않습니다. Pylance/pyright, ruff와 공존하며 일반 completion/type checking/formatting/linting을 하지 않습니다.

## 구성

```text
VS Code extension (discovery + UI) → rextio-lsp (contract → LSP) → Rextio + plugins (analysis/build)
```

`rextio.toml`이 있는 workspace에서만 activate됩니다. 검색 순서는 `rextio.server.path`, workspace `.venv`/`venv`의 executable(`Scripts\\rextio-lsp.exe` on Windows), `PATH`입니다. 실패하면 status bar warning과 **Rextio** output 기록이 남습니다. Non-modal prompt는 workspace venv를 우선하고 `--break-system-packages`를 쓰지 않으며 **Skip**은 **Rextio: Restart Server**까지 기억됩니다.

## 설정

| 설정 | 기본값 | 용도 |
| --- | --- | --- |
| `rextio.enable` | `true` | language client 실행 |
| `rextio.server.path` | `""` | server executable; 빈 값은 자동 검색 |
| `rextio.server.args` | `[]` | server 추가 인자 |
| `rextio.codeLens.enable` | `true` | route CodeLens |
| `rextio.interpreter.path` | `""` | 서버로 전달할 Python; 빈 값은 `null` |
| `rextio.trace.server` | `off` | `off`, `messages`, `verbose` |

Launch-time 설정 변경은 client를 재시작하지만 trace는 즉시 적용됩니다. Module 실행은 Python을 `rextio.server.path`로 지정하고 `rextio.server.args`를 `["-m", "rextio_lsp"]`로 설정합니다.

## 명령과 문제 해결

- **Rextio: Restart Server**와 status item click은 server를 재시작하고 install skip을 해제합니다.
- **View → Output → Rextio**에서 discovery, pip, trace, route notice를 봅니다.
- 서버가 없으면 **Install into .venv (Recommended)** 또는 `python -m pip install rextio-lsp` 후 재시작합니다.

## 호환성

| 구성 요소 | 계약 |
| --- | --- |
| 확장 / ID | `0.1.1` (2026-07-26) / `rextio.rextio-vscode` |
| VS Code / client | engine `^1.82.0` / `vscode-languageclient ^9.0.1` |
| Server | 외부 `rextio-lsp`, bundle하지 않음 |
| Activation | `workspaceContains:rextio.toml` |
| 배포 | 같은 verified VSIX로 Marketplace와 Open VSX 대상 |

## 개발

Node.js 20.19+가 필요합니다.

```bash
npm install
npm run check-types
npm run lint
npm test
npm run build
npm run package
```

[DEVELOPMENT.md](https://github.com/rextio/rextio-vscode/blob/main/DEVELOPMENT.md)를 참고하세요.

## 라이선스

[MIT](LICENSE)
