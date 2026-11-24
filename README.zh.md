# DS Bot 插件仓库

[English](README.md) | 中文

[DS Bot](https://github.com/Fei2411/DS-Bot) 的官方插件收录仓库与开发脚手架。

DS Bot 的 **插件面板（Plugins）** 默认拉取本仓库的 [`registry.json`](registry.json)，让用户可以在桌面应用与插件版里一键发现、安装与热切换 Bot 插件（首批提供多个可替换的浏览器插件）。

## 首批收录插件（浏览器槽位 `browser`）

| 插件 | 类型 | 槽位 | 说明 |
|---|---|---|---|
| **Ego Lite 浏览器**（`dsh:dsh-ego-browser`） | DSH 插件 | `browser` | 基于 Ego Lite 的外部 DSH 浏览器插件，支持人机共用 Chromium 会话。 |
| **Playwright MCP**（`mcp:playwright-mcp`） | MCP 服务 | `browser` | 官方 Playwright MCP 服务（`@playwright/mcp`），基于可访问性树操控浏览器。 |
| **Chrome DevTools MCP**（`mcp:chrome-devtools-mcp`） | MCP 服务 | `browser` | 基于 Chrome DevTools 协议的 MCP 服务（`chrome-devtools-mcp`），支持页面调试与操控。 |

*（DS Bot 本体另内置 4 个可替换浏览器后端：`builtin:readonly`、`builtin:refs`、`builtin:script`、`builtin:task`。）*

## 仓库结构

- `manifests/*.json`：每个收录插件独立一个清单文件，社区并发提 PR 零冲突。
- `registry.json`：自动生成的机器可读索引（由 `npm run build` 生成，请勿手改）。
- `schema/plugin.schema.json`：插件清单 v1 JSON Schema。
- `scripts/build-registry.mjs`：零依赖校验与 `registry.json` 生成脚本。
- `templates/basic-bot-plugin/`：通用 Bot 插件模板（`defineBotPlugin`）。
- `templates/browser-provider-plugin/`：可替换浏览器插件模板（`defineBrowserProvider`）。

## 如何提交插件

1. Fork 本仓库，参照 `schema/plugin.schema.json` 在 `manifests/` 下新增 `<插件名>.json`。
2. 运行 `npm run build` 更新 `registry.json`，并跑 `npm run validate` 确认通过。
3. 提交 Pull Request。GitHub Actions 会自动校验 schema、安全 URL、无明文凭据以及索引同步。

### 收录安全要求

- `homepage` / `repository` 必须为合法 `https://` 地址，禁止内嵌凭据。
- MCP 插件清单禁止硬编码任何 token、密码或 API Key，敏感项一律使用 `$DSH_SECRET_<NAME>` 引用 DS Bot 密钥。
- 互斥槽位插件（如 `slot: "browser"`）需如实填写 `toolPrefixes`，以便未激活时干净隔离工具。

## 许可

Apache-2.0
