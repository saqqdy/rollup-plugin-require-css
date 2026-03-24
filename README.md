<div style="text-align: center;" align="center">

# rollup-plugin-require-css

A powerful rollup plugin for importing CSS with CSS Modules, preprocessors, and more

[![NPM version][npm-image]][npm-url]
[![Codacy Badge][codacy-image]][codacy-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]
[![License][license-image]][license-url]

[![Sonar][sonar-image]][sonar-url]

</div>

<div style="text-align: center; margin-bottom: 20px;" align="center">

### **[Documentation](https://www.saqqdy.com/rollup-plugin-require-css)** • **[Change Log](./CHANGELOG.md)**

</div>

## Features

- 🎨 **CSS Modules** - Auto-detect or force enable CSS Modules with scoped class names
- 📦 **Preprocessor Support** - Sass/SCSS, Less, Stylus out of the box
- ⚡ **PostCSS Integration** - Use any PostCSS plugins like autoprefixer
- 🗺️ **Source Maps** - Generate accurate source maps for debugging
- 🔥 **HMR Support** - Hot Module Replacement for development
- ✂️ **Code Splitting** - Split CSS by entry points
- 💾 **Caching** - Speed up rebuilds with file cache
- 🗜️ **Minification** - Advanced CSS minification options
- 🔌 **Plugin API** - Access styles, CSS modules, and stats programmatically

## Installing

```bash
# use pnpm
$ pnpm install -D rollup-plugin-require-css

# use npm
$ npm install -D rollup-plugin-require-css

# use yarn
$ yarn add -D rollup-plugin-require-css
```

## Usage

### Basic Usage

```js
// rollup.config.js
import requireCSS from 'rollup-plugin-require-css'

export default {
  plugins: [
    requireCSS({
      output: 'style.css',
      minify: true
    })
  ]
}
```

### CSS Modules

```js
// Auto-detect .module.css files
import styles from './button.module.css'

console.log(styles.button) // "_button_x5f2a"

// Or force enable for all CSS
requireCSS({ modules: true })
```

### With Preprocessors

```js
// Install the preprocessor first
// pnpm add -D sass

import './styles.scss'
import './theme.less'
import './base.styl'

// In rollup.config.js
requireCSS({
  preprocessor: {
    sass: { includePaths: ['src/styles'] },
    less: { paths: ['src/styles'] },
    stylus: { paths: ['src/styles'] }
  }
})
```

### With PostCSS

```js
// Install postcss and plugins
// pnpm add -D postcss autoprefixer

requireCSS({
  postcss: {
    enabled: true,
    plugins: [
      require('autoprefixer')()
    ]
  }
})
```

### Source Maps

```js
requireCSS({
  sourcemap: true,      // Generate inline source map
  sourcemap: 'inline',  // Inline source map
  sourcemap: 'external' // External .css.map file
})
```

### Code Splitting

```js
export default {
  input: ['src/a.js', 'src/b.js'],
  output: { dir: 'dist', format: 'es' },
  plugins: [
    requireCSS({
      split: true,  // Generate separate CSS per entry
      output: (chunk) => `${chunk.name}.css`
    })
  ]
}
```

### Shadow DOM Support

```js
import styles from './component.css' assert { type: 'css' }

class MyElement extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.adoptedStyleSheets = [styles]
  }
}
```

## Options

### `output`

- Type: `string | ((chunk: OutputInfo) => string)`
- Default: Auto-detect from output file name

CSS output file name or a function that returns the file name.

### `inject`

- Type: `boolean`
- Default: `false`

Inject CSS into the bundle or extract to a separate file.

### `minify`

- Type: `boolean | MinifyOptions`
- Default: `false`

Enable CSS minification with optional fine-grained control:

```js
requireCSS({
  minify: {
    removeComments: true,
    collapseWhitespace: true,
    removeRedundantValues: true,
    mergeRules: false,
    optimizeSelectors: false
  }
})
```

### `modules`

- Type: `boolean | CSSModulesOptions`
- Default: `{ enabled: 'auto' }`

Enable CSS Modules:

```js
requireCSS({
  modules: {
    enabled: true, // or 'auto'
    generateScopedName: (name, filename, css) => `_${name}_${hash(css)}`,
    globalModulePaths: [/global\.css$/]
  }
})
```

### `postcss`

- Type: `PostCSSOptions`

Configure PostCSS integration:

```js
requireCSS({
  postcss: {
    enabled: true,
    plugins: [require('autoprefixer')()],
    options: {}
  }
})
```

### `preprocessor`

- Type: `PreprocessorOptions`

Configure preprocessor support:

```js
requireCSS({
  preprocessor: {
    sass: { includePaths: ['src'] },
    less: { paths: ['src'] },
    stylus: { paths: ['src'] }
  }
})
```

### `sourcemap`

- Type: `boolean | 'inline' | 'external'`
- Default: `false`

Generate source maps for CSS.

### `split`

- Type: `boolean`
- Default: `false`

Enable CSS code splitting for multiple entry points.

### `hmr`

- Type: `boolean`
- Default: `false`

Enable Hot Module Replacement support.

### `cache`

- Type: `boolean | CacheOptions`
- Default: `false`

Enable caching for faster rebuilds:

```js
requireCSS({
  cache: {
    enabled: true,
    dir: '.cache/css',
    ttl: 3600000 // 1 hour
  }
})
```

### `transform`

- Type: `(code: string, id: string) => string | Promise<string>`

Custom transform function for CSS processing.

### `onExtract`

- Type: `(css: string, chunk: OutputInfo) => void`

Callback when CSS is extracted.

## Plugin API

Access plugin internals through the `api` property:

```js
const plugin = requireCSS()

// Get all collected styles
plugin.api.getStyles()

// Get CSS Modules class mappings
plugin.api.getCSSModules()

// Get specific class name
plugin.api.getClassName('/path/to/file.css', 'button')

// Get statistics
plugin.api.getStats()

// Clear cache
plugin.api.clearCache()
```

## Support & Issues

Please open an issue [here](https://github.com/saqqdy/rollup-plugin-require-css/issues).

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/rollup-plugin-require-css.svg?style=flat-square
[npm-url]: https://npmjs.org/package/rollup-plugin-require-css
[codacy-image]: https://app.codacy.com/project/badge/Grade/f70d4880e4ad4f40aa970eb9ee9d0696
[codacy-url]: https://www.codacy.com/gh/saqqdy/rollup-plugin-require-css/dashboard?utm_source=github.com&utm_medium=referral&utm_content=saqqdy/rollup-plugin-require-css&utm_campaign=Badge_Grade
[codecov-image]: https://img.shields.io/codecov/c/github/saqqdy/rollup-plugin-require-css.svg?style=flat-square
[codecov-url]: https://codecov.io/github/saqqdy/rollup-plugin-require-css?branch=master
[download-image]: https://img.shields.io/npm/dm/rollup-plugin-require-css.svg?style=flat-square
[download-url]: https://npmjs.org/package/rollup-plugin-require-css
[license-image]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: LICENSE
[sonar-image]: https://sonarcloud.io/api/project_badges/quality_gate?project=saqqdy_rollup-plugin-require-css
[sonar-url]: https://sonarcloud.io/dashboard?id=saqqdy_rollup-plugin-require-css
