import path from 'path'

export function validateDependency() {
  try {
    import.meta.resolve('vue')
  } catch {
    throw new Error('vue has not been installed')
  }
}

export function resolvePath(filePath: string) {
  const [filename, query] = filePath.split('?', 2)
  const dirname = path.dirname(filename)
  return [filename, dirname, query]
}
