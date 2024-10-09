import { plugin, type BunPlugin, type Loader } from "bun"
import { randomBytes as _randomBytes, createHash } from 'crypto'
import fs from 'fs/promises'
import { resolvePath, validateDependency } from "./util"
import { loadEntry } from "./entry"
import { resolveScript } from "./script"
import { resolveTemplate } from "./template"
import { resolveStyle } from "./style"
import { parse as parse2 } from "querystring"

validateDependency()

export function pluginVue3(): BunPlugin {
  return {
    name: "vue loader",
    setup(build) {
      const isProd = process.env.NODE_ENV === "production"

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

      build.onResolve({ filter: /\.vue\?type=template/ }, args => {
        return {
          path: args.path,
          namespace: 'vue-template'
        }
      })

      build.onLoad({ filter: /.*/, namespace: 'vue-template' }, args => {
        const [filename, dirname] = resolvePath(args.path)
        const { code, errors } = resolveTemplate(
          filename,
          undefined,
          isProd
        )
        return {
          contents: code,
          errors,
          resolveDir: dirname
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
          loader: moduleWithNameImport ? 'json' : 'json'
        }
      })
    },
  }
}

export default plugin(pluginVue3())
