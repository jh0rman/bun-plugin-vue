import { describe, test, expect } from 'bun:test'
import defaultExport, { pluginVue3 } from '../src/index.ts'

async function build(entrypoint: string) {
  return Bun.build({
    entrypoints: [entrypoint],
    plugins: [pluginVue3()],
  })
}

describe('[serve.static] plugins = ["bun-plugin-vue3"] — default export contract', () => {
  // Bun serve loads the module and passes its default export to the bundler.
  // It requires: typeof default === object, with name (string) and setup (function).
  test('default export is a valid BunPlugin (name + setup)', () => {
    expect(typeof defaultExport).toBe('object')
    expect(typeof defaultExport.name).toBe('string')
    expect(typeof defaultExport.setup).toBe('function')
  })

  test('default export can be used directly in Bun.build (same as serve static)', async () => {
    const result = await Bun.build({
      entrypoints: ['./tests/fixtures/Basic.vue'],
      plugins: [defaultExport],
    })
    expect(result.success).toBe(true)
    expect(result.logs).toHaveLength(0)
  })

  test('default export handles scoped styles', async () => {
    const result = await Bun.build({
      entrypoints: ['./tests/fixtures/WithStyles.vue'],
      plugins: [defaultExport],
    })
    expect(result.success).toBe(true)
    const js = await result.outputs.find(o => o.kind === 'entry-point')!.text()
    expect(js).toContain('__scopeId')
  })

  test('default export handles CSS Modules', async () => {
    const result = await Bun.build({
      entrypoints: ['./tests/fixtures/CssModules.vue'],
      plugins: [defaultExport],
    })
    expect(result.success).toBe(true)
    const js = await result.outputs.find(o => o.kind === 'entry-point')!.text()
    expect(js).toContain('__cssModules')
  })
})

describe('Bun.build() — pluginVue3() explicit', () => {
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
