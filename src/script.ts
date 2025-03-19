import { compileScript } from '@vue/compiler-sfc'
import { getDesCache, getId } from './cache'
import { getTemplateOptions } from './template'
import ts from 'typescript'

export function resolveScript(
  filename: string,
  scriptOptions = {},
  templateOptions = {},
  isProd: boolean
) {
  const descriptor = getDesCache(filename)
  const error: any[] = []
  const { script, scriptSetup } = descriptor
  const isTs = (script && script.lang === 'ts') || (scriptSetup && scriptSetup.lang === 'ts')

  let code = 'export default {}'
  if (!descriptor.script && !descriptor.scriptSetup) {
    return { code }
  }

  const scopeId = getId(filename)
  try {
    const res = compileScript(descriptor, {
      id: scopeId,
      isProd,
      inlineTemplate: true,
      templateOptions: descriptor.template ? getTemplateOptions(descriptor, templateOptions, isProd) : {},
      fs: ts.sys
    })
    code = res.content
  } catch (e: any) {
    error.push({
      text: e.message
    })
  }

  return {
    code,
    error,
    isTs
  }
}
