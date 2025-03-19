# bun-plugin-vue3

A Bun plugin for [Vue 3](https://vuejs.org/) Single File Components.

[![NPM version][npm-version-image]][npm-url]
[![install size](https://packagephobia.com/badge?p=bun-plugin-vue3)](https://packagephobia.com/result?p=bun-plugin-vue3)
![NPM Downloads][npm-downloads-image]

## Installation

```sh
bun add -D bun-plugin-vue3
```

## Dev Server Usage

`bun-plugin-vue3` integrates with Bun's [Fullstack Dev Server](https://bun.sh/docs/bundler/fullstack), giving you HMR when developing your Vue app.

Start by registering it in your [bunfig.toml](https://bun.sh/docs/runtime/bunfig):

```toml
[serve.static]
plugins = ["bun-plugin-vue3"]
```

Then start your dev server:

```sh
bun index.html
```

## Bundler Usage

`bun-plugin-vue3` lets you bundle Vue components with [`Bun.build`](https://bun.sh/docs/bundler).

```ts
// build.ts
// to use: bun build.ts
import { pluginVue3 } from 'bun-plugin-vue3'

await Bun.build({
  entrypoints: ['./index.html'],
  outdir: './dist',
  plugins: [
    pluginVue3({
      isProduction: false, // Enable for production builds
    }),
  ],
})
```

## Development

### Setup

```bash
git clone https://github.com/jh0rman/bun-plugin-vue.git
cd bun-plugin-vue
bun install
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

[npm-version-image]: https://img.shields.io/npm/v/bun-plugin-vue3.svg
[npm-url]: https://npmjs.org/package/bun-plugin-vue3
[npm-downloads-image]: https://img.shields.io/npm/dm/bun-plugin-vue3.svg
