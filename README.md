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
  plugins: [requireCss(options)]
}
```

2. use require

```js
// rollup.config.js
const requireCss = require('rollup-plugin-require-css')

module.exports = {
  plugins: [requireCss(options)]
}
```

## Types

```ts
interface Options {
  /**
   * The transform function is used for processing the CSS, it receives a string containing the code to process as an argument. The function should return a string.
   */
  transform?: (code: string) => string
  /**
   * An output file name for the css bundle.
   */
  output?: string
  /**
   * A single file, or array of files to include when minifying.
   */
  include?: string | string[]
  /**
   * A single file, or array of files to exclude when minifying.
   */
  exclude?: string | string[]
  /**
   * All css files being imported with a variable will use native CSS Modules.
   */
  styleSheet?: boolean
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
