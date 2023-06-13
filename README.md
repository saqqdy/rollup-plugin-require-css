<div style="text-align: center;" align="center">

# rollup-plugin-require-css

A rollup plugin for import css

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

1. use import

```js
// rollup.config.js
import requireCss from 'rollup-plugin-require-css'

export default {
  plugins: [
    requireCss({
      path: './node_modules/axios-serializer/dist/index.min.js',
      position: 'before'
    })
  ]
}
```

2. use require

```js
// rollup.config.js
const requireCss = require('rollup-plugin-require-css')

module.exports = {
  plugins: [
    requireCss({
      path: './node_modules/axios-serializer/dist/index.min.js',
      position: 'before'
    })
  ]
}
```

## Types

```ts
import type { Plugin } from 'rollup'

export interface MinifyOptions {
  compress?: boolean | CompressOptions
  ecma?: ECMA
  enclose?: boolean | string
  ie8?: boolean
  keep_classnames?: boolean | RegExp
  keep_fnames?: boolean | RegExp
  mangle?: boolean | MangleOptions
  module?: boolean
  nameCache?: object
  format?: FormatOptions
  /** @deprecated */
  output?: FormatOptions
  parse?: ParseOptions
  safari10?: boolean
  sourceMap?: boolean | SourceMapOptions
  toplevel?: boolean
}

/**
 * A rollup plugin for import css
 *
 * @param options - options
 * @returns Plugin - requireCss plugin
 */
declare function requireCss(options: OptionsPath): Plugin

declare function requireCss(options: OptionsCode): Plugin
export default requireCss

export declare interface Options {
  /**
   * for es6 import
   *
   * @example ''
   */
  /**
   * for es6 export
   *
   * @example ''
   */
  /**
   * for node require
   *
   * @example ''
   */
  /**
   * for node exports
   *
   * @example ''
   */
  position?: 'before' | 'after'
  /**
   * A string to prepend to the bundle
   */
  intro?: string
  /**
   * A string to append to the bundle
   */
  outro?: string
  /**
   * minify the codes
   */
  minify?: boolean
  /**
   * minify options for terser
   */
  minifyOptions?: MinifyOptions
}

export declare interface OptionsCode extends Options {
  /**
   * inject code string
   * @description Only one of “path” and “code” needs to be passed in, and "path" has higher priority than "code" when both are passed in
   */
  code: string
}

export declare interface OptionsPath extends Options {
  /**
   * inject code path
   * @description Only one of “path” and “code” needs to be passed in, and "path" has higher priority than "code" when both are passed in
   */
  path: string
}
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
