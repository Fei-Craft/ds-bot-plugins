# DS Bot Plugins

[中文](README.zh.md) | English

Official plugin registry and starter templates for [DS Bot](https://github.com/Fei2411/DS-Bot).

DS Bot's **Plugins** panel reads [`registry.json`](registry.json) from this repository so users can discover, install, and hot-swap Bot plugins (starting with replaceable browser plugins) in one click.

## Featured first-batch plugins (Browser slot)

| Plugin | Kind | Slot | Description |
|---|---|---|---|
| **Playwright MCP** (`mcp:playwright-mcp`) | MCP server | `browser` | Official Playwright MCP server (`@playwright/mcp`). Runs in a separate browser window outside DS Bot's sidebar. |
| **Chrome DevTools MCP** (`mcp:chrome-devtools-mcp`) | MCP server | `browser` | Chrome DevTools Protocol MCP server (`chrome-devtools-mcp`). Controls an external Chrome window outside DS Bot's sidebar. |

*(DS Bot also ships four built-in replaceable browser backends out of the box: `builtin:readonly`, `builtin:refs`, `builtin:script`, and `builtin:task`.)*

## Repository layout

- `manifests/*.json`: One manifest file per listed plugin (one file per plugin avoids merge conflicts across community PRs).
- `registry.json`: Generated index consumed by DS Bot's Plugins panel (do not edit by hand; run `npm run build`).
- `schema/plugin.schema.json`: JSON Schema for manifest v1.
- `scripts/build-registry.mjs`: Validator and deterministic `registry.json` generator.
- `templates/basic-bot-plugin/`: Starter template for a general Bot plugin using `defineBotPlugin`.
- `templates/browser-provider-plugin/`: Starter template for a replaceable browser plugin using `defineBrowserProvider`.

## Submitting a plugin

1. Fork this repository and add `manifests/<your-plugin-id>.json` following `schema/plugin.schema.json`.
2. Run `npm run build` to regenerate `registry.json`, then verify with `npm run validate`.
3. Open a pull request. CI automatically validates schema compliance, safe HTTPS links, secret-handling rules (no hardcoded credentials), and `registry.json` freshness.

### Security rules for listed plugins

- All homepage and repository URLs must use `https://` with no embedded credentials.
- MCP manifests must never include plaintext tokens, passwords, or API keys — reference DS Bot Secrets via `$DSH_SECRET_<NAME>`.
- Exclusive-slot plugins (such as `slot: "browser"`) must declare accurate `toolPrefixes` so DS Bot cleanly isolates inactive backends.

## License

Apache-2.0
