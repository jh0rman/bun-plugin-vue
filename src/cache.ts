import { createHash } from 'node:crypto'
import type { SFCDescriptor } from 'vue/compiler-sfc'

const descriptorCache: Record<string, SFCDescriptor> = {}

export function setDesCache(filename: string, descriptor: SFCDescriptor) {
  descriptorCache[filename] = descriptor
}

export function getDesCache(filename: string) {
  let cache = descriptorCache[filename]
  if (!cache) {
    throw new Error('no descriptor cache')
  }
  return cache
}

const idCache: Record<string, string> = {}

export function setId(filename: string) {
  const id = createHash("md5").update(filename).digest().toString("hex").substring(0, 8)
  return (idCache[filename] = `data-v-${id}`)
}

export function getId(filename: string) {
  let id = idCache[filename]
  if (!id) {
    throw new Error('no scope id')
  }
  return id
}
