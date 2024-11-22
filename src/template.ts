import { getDesCache, getId } from './cache'
import { compileTemplate, type SFCDescriptor, type SFCTemplateCompileOptions } from 'vue/compiler-sfc'

export function resolveTemplate(filename: string, options: any['templateOptions'] = {}, isProd: boolean) {
  const descriptor = getDesCache(filename)

  let { code, errors, map } = compileTemplate(getTemplateOptions(descriptor, options, isProd))

  // if (map) {
  //   code += convert.fromObject(map).toComment()
  // }

  const convertedErrors: any[] = errors.map(e => {
    if (typeof e === 'string') {
      return {
        text: e
      }
    } else {
      return {
        text: e.message
      }
    }
  })

  return {
    code,
    errors: convertedErrors
  }
}

export function getTemplateOptions(
  descriptor: SFCDescriptor,
  options: any['templateOptions'],
  isProd: boolean
): SFCTemplateCompileOptions {
  const filename = descriptor.filename
  const scopeId = getId(filename)
  return {
    source: descriptor.template!.content,
    filename,
    id: scopeId,
    scoped: descriptor.styles.some(s => s.scoped),
    isProd,
    inMap: descriptor.template!.map,
    compiler: options?.compiler,
    preprocessLang: options?.preprocessLang,
    preprocessOptions: options?.preprocessOptions,
    compilerOptions: {
      ...options?.compilerOptions,
      scopeId
    },
    transformAssetUrls: options?.transformAssetUrls
  }
}
