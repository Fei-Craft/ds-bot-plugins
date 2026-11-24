// Starter template for a native DS Bot plugin using `ctx.dsBotPlugins`.
export const name = 'ds-bot-plugin-example'
export const inject = { optional: ['dsBotPlugins'] }

export function apply(ctx) {
  const register = () => {
    const plugins = ctx.get?.('dsBotPlugins')
    if (!plugins) return
    return plugins.registerPlugin({
      id: 'ext:example',
      name: 'Example Bot Plugin',
      description: 'Demonstrates a native DS Bot plugin with per-Bot toggle support.',
      category: 'tools',
      toolPrefixes: ['example_'],
      packageName: 'ds-bot-plugin-example',
      mount(host) {
        host.registerTool(host.defineTool({
          name: 'example_ping',
          description: 'Return a friendly greeting from the example plugin.',
          parameters: {
            name: { type: 'string', description: 'Optional name to greet' },
          },
          async execute(args) {
            return `Hello, ${args?.name || 'Bot'}!`
          },
        }))
        return { dispose: () => {} }
      },
    })
  }

  let off = register()
  ctx.on?.('internal/service', (key) => {
    if (key === 'dsBotPlugins' && !off) off = register()
  })
  ctx.effect(() => () => { off?.(); off = undefined })
}
