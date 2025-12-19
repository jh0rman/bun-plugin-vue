import { plugin, type BunPlugin } from "bun"
import { resolve } from 'node:path'
import { parse as parse2 } from "node:querystring"
import { parseDefine, resolvePath, validateDependency } from "./util"
import { loadEntry } from "./entry"
import { resolveScript } from "./script"
import { resolveTemplate } from "./template"
import { resolveStyle } from "./style"

export interface VuePluginOptions {
  isProduction?: boolean
  features?: {
    /**
     * Set to `false` to disable Options API support and allow related code in
     * Vue core to be dropped via dead-code elimination in production builds,
     * resulting in smaller bundles.
     * - **default:** `true`
     */
    optionsAPI?: boolean
    /**
     * Set to `true` to enable devtools support in production builds.
     * Results in slightly larger bundles.
     * - **default:** `false`
     */
    prodDevtools?: boolean
    /**
     * Set to `true` to enable detailed information for hydration mismatch
     * errors in production builds. Results in slightly larger bundles.
     * - **default:** `false`
     */
    prodHydrationMismatchDetails?: boolean
  }
}

validateDependency()

export function pluginVue3(rawOptions: VuePluginOptions = {}): BunPlugin {
  return {
    name: "vue loader",
    setup(build) {
      const options = {
        isProduction: process.env.NODE_ENV === 'production',
        ...rawOptions
      }

      // TODO: Seems like define does not work in Bun, check if it is fixed in the future
      // build.config is undefined in the runtime plugin context (bun test / preload)
      const isBundlerContext = !!build.config
      const originalDefine = build.config?.define || {}
      if (build.config) build.config.define = {
        ...originalDefine,
        '__VUE_OPTIONS_API__': JSON.stringify(
          options.features?.optionsAPI ?? 
          parseDefine(originalDefine.__VUE_OPTIONS_API__) ?? 
          true
        ),
        '__VUE_PROD_DEVTOOLS__': JSON.stringify(
          options.features?.prodDevtools ?? 
          parseDefine(originalDefine.__VUE_PROD_DEVTOOLS__) ?? 
          false
        ),
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(
          options.features?.prodHydrationMismatchDetails ?? 
          parseDefine(originalDefine.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__) ?? 
          false
        ),
      }
      
      const isProd = process.env.NODE_ENV === "production"

      build.onResolve({ filter: /\.vue(\?.*)?$/ }, args => {
        if (!args.resolveDir) return
        return {
          path: resolve(args.resolveDir, args.path),
        }
      })

      build.onLoad({ filter: /\.vue$/ }, async args => {
        const filename = args.path
        const source = await Bun.file(filename).text()
        const { code } = loadEntry(source, filename)
        return {
          contents: code,
        }
      })

      build.onLoad({ filter: /\.vue\?type=script/ }, args => {
        const [filename, dirname] = resolvePath(args.path)
        const { code, error, isTs } = resolveScript(
          filename,
          undefined,
          undefined,
          isProd
        )
        return {
          contents: code,
          errors: error,
          resolveDir: dirname,
          loader: isTs ? 'tsx' : 'js'
        }
      })

      build.onLoad({ filter: /\.vue\?type=template/ }, args => {
        const [filename, dirname] = resolvePath(args.path)
        const { code, errors } = resolveTemplate(
          filename,
          undefined,
          isProd
        )
        return {
          contents: code,
          errors,
          resolveDir: dirname,
          loader: 'tsx',
        }
      })

      build.onLoad({ filter: /\.vue\?type=style/ }, async args => {
        const [filename, dirname, query] = resolvePath(args.path)
        const { index, isModule, isNameImport } = parse2(query)
        const moduleWithNameImport = !!(isModule && isNameImport)
        const { styleCode, errors } = await resolveStyle(
          filename,
          undefined,
          Number(index),
          !!isModule,
          moduleWithNameImport,
          isProd
        )
        if (moduleWithNameImport) {
          return {
            contents: `export default ${styleCode}`,
            errors,
            resolveDir: dirname,
            loader: 'js'
          }
        }
        // In bundler context (Bun.build / bun serve) use the css loader so Bun
        // bundles the styles natively. In the runtime/test context the css
        // loader is not supported, so return an empty module (side-effect CSS
        // has no DOM to inject into in tests anyway).
        return {
          contents: isBundlerContext ? styleCode : '',
          errors,
          resolveDir: dirname,
          loader: isBundlerContext ? 'css' : 'js'
        }
      })
    },
  }
}

const _plugin = pluginVue3()
plugin(_plugin) // auto-register for [test] preload
export default _plugin // export BunPlugin for [serve.static] plugins
