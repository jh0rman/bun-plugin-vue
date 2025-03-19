import { type BunPlugin } from "bun"
import { randomBytes as _randomBytes } from 'node:crypto'
import fs from 'node:fs/promises'
import { resolve } from 'node:path'
import { parse as parse2 } from "node:querystring"
import { resolvePath, validateDependency } from "./util"
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
      const originalDefine = build.config.define || {}
      build.config.define = {
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
        return {
          path: resolve(args.resolveDir, args.path),
        }
      })

      build.onLoad({ filter: /\.vue$/ }, async args => {
        const filename = args.path
        const source = await fs.readFile(filename, 'utf8')
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
        return {
          contents: styleCode,
          errors,
          resolveDir: dirname,
          loader: moduleWithNameImport ? 'json' : 'css'
        }
      })
    },
  }
}

const parseDefine = (v: unknown) => {
  try {
    return typeof v === 'string' ? JSON.parse(v) : v
  } catch (err) {
    return v
  }
}

export default pluginVue3()
