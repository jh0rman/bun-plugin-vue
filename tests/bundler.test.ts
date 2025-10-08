import { describe, test, expect } from 'bun:test'
import { pluginVue3 } from '../src/index.ts'

// Covers both Bun.build() and [serve.static] plugins = ["bun-plugin-vue3"]:
// bun serve takes the default export (a BunPlugin object) and passes it
// explicitly to its bundler — identical to what we do here.
async function build(entrypoint: string) {
  return Bun.build({
    entrypoints: [entrypoint],
    plugins: [pluginVue3()],
  })
}

describe('Bun.build() / [serve.static] plugins', () => {
  test('builds a basic Options API component', async () => {
    const result = await build('./tests/fixtures/Basic.vue')
    expect(result.success).toBe(true)
    expect(result.logs).toHaveLength(0)
  })

  test('builds a <script setup> component', async () => {
    const result = await build('./tests/fixtures/ScriptSetup.vue')
    expect(result.success).toBe(true)
    expect(result.logs).toHaveLength(0)
  })

  test('builds a component with scoped styles', async () => {
    const result = await build('./tests/fixtures/WithStyles.vue')
    expect(result.success).toBe(true)
    expect(result.logs).toHaveLength(0)

    const js = await result.outputs.find(o => o.kind === 'entry-point')!.text()
    expect(js).toContain('__scopeId')
  })

  test('builds a component with CSS Modules', async () => {
    const result = await build('./tests/fixtures/CssModules.vue')
    expect(result.success).toBe(true)
    expect(result.logs).toHaveLength(0)

    const js = await result.outputs.find(o => o.kind === 'entry-point')!.text()
    expect(js).toContain('__cssModules')
  })

  test('builds an HTML entrypoint importing Vue components (bun index.html pipeline)', async () => {
    const result = await build('./tests/fixtures/app.html')
    expect(result.success).toBe(true)
    expect(result.logs).toHaveLength(0)

    const js = await result.outputs.find(o => o.kind === 'entry-point')!.text()
    expect(js).toContain('createApp')
  })
})
