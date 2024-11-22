import { compileStyleAsync, type SFCStyleCompileOptions } from 'vue/compiler-sfc'
import { getDesCache, getId } from './cache'

export async function resolveStyle(
  filename: string,
  styleOptions: any['styleOptions'] = {},
  index: number,
  isModule: boolean,
  moduleWithNameImport: boolean,
  isProd: boolean
) {
  const descriptor = getDesCache(filename)
  const styleBlock = descriptor.styles[index]
  const scopeId = getId(filename)

  const res = await compileStyleAsync({
    source: styleBlock.content,
    filename: descriptor.filename,
    id: scopeId,
    scoped: styleBlock.scoped,
    trim: true,
    isProd,
    inMap: styleBlock.map,
    preprocessLang: styleBlock.lang as SFCStyleCompileOptions['preprocessLang'],
    preprocessOptions: styleOptions.preprocessOptions,
    postcssOptions: styleOptions.postcssOptions,
    postcssPlugins: styleOptions.postcssPlugins,
    modules: isModule,
    modulesOptions: styleOptions.modulesOptions
  })
  let styleCode: string
  if (moduleWithNameImport) {
    // css-modules JSON file
    styleCode = JSON.stringify(res.modules!)
  } else {
    // normal css content
    styleCode = res.code
  }

  // if (res.map && !moduleWithNameImport) {
  //   styleCode += convert.fromObject(res.map).toComment({ multiline: true })
  // }
  const errors: any[] = res.errors.map(e => ({
    text: e.message
  }))

  return {
    errors,
    styleCode
  }
}
