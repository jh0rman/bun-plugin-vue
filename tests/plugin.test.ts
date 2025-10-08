import { describe, test, expect } from 'bun:test'
import Basic from './fixtures/Basic.vue'
import ScriptSetup from './fixtures/ScriptSetup.vue'
import WithStyles from './fixtures/WithStyles.vue'
import CssModules from './fixtures/CssModules.vue'

describe('bun-plugin-vue3', () => {
  describe('Options API', () => {
    test('imports as a component definition object', () => {
      expect(Basic).toBeDefined()
      expect(typeof Basic).toBe('object')
    })

    test('preserves component name', () => {
      expect(Basic.name).toBe('Basic')
    })

    test('compiles template into a render function', () => {
      expect(typeof Basic.render).toBe('function')
    })
  })

  describe('<script setup>', () => {
    test('imports as a component definition object', () => {
      expect(ScriptSetup).toBeDefined()
    })

    test('exposes a setup function', () => {
      expect(typeof ScriptSetup.setup).toBe('function')
    })
  })

  describe('scoped styles', () => {
    test('imports component with scoped styles', () => {
      expect(WithStyles).toBeDefined()
      expect(WithStyles.name).toBe('WithStyles')
    })

    test('attaches __scopeId for scoped styles', () => {
      expect(typeof WithStyles.__scopeId).toBe('string')
      expect(WithStyles.__scopeId).toMatch(/^data-v-/)
    })
  })

  describe('CSS Modules', () => {
    test('imports component with CSS modules', () => {
      expect(CssModules).toBeDefined()
      expect(CssModules.name).toBe('CssModules')
    })

    test('exposes __cssModules with the default $style map', () => {
      expect(CssModules.__cssModules).toBeDefined()
      expect(CssModules.__cssModules['$style']).toBeDefined()
    })

    test('class map contains the declared class names', () => {
      const style = CssModules.__cssModules['$style']
      expect(typeof style.container).toBe('string')
      expect(typeof style.text).toBe('string')
    })
  })
})
