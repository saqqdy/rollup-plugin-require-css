<div style="text-align: center;" align="center">

# rollup-plugin-require-css

一个强大的 Rollup 插件，支持 CSS Modules、预处理器等功能

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

</div>

<div style="text-align: center; margin-bottom: 20px;" align="center">

### **[更新日志](./CHANGELOG.md)** • **[English](./README.md)**

</div>

## 特性

- 🎨 **CSS Modules** - 自动检测或强制启用 CSS Modules，支持作用域类名
- 📦 **预处理器支持** - 开箱即用支持 Sass/SCSS、Less、Stylus
- ⚡ **PostCSS 集成** - 支持任意 PostCSS 插件，如 autoprefixer
- 🗺️ **Source Maps** - 生成精确的 Source Map 用于调试
- 🔥 **HMR 支持** - 开发环境热模块替换
- ✂️ **代码分割** - 按入口点分割 CSS
- 💾 **缓存** - 文件缓存加速重新构建
- 🗜️ **压缩** - 高级 CSS 压缩选项
- 🔌 **插件 API** - 编程访问样式、CSS Modules 和统计信息

## 在线体验

直接在浏览器中试用示例：

| 示例 | CodeSandbox | StackBlitz |
|------|-------------|------------|
| basic | [打开 →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/basic) | [打开 →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/basic) |
| css-modules | [打开 →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/css-modules) | [打开 →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/css-modules) |
| preprocessors | [打开 →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/preprocessors) | [打开 →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/preprocessors) |
| postcss | [打开 →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/postcss) | [打开 →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/postcss) |
| code-splitting | [打开 →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/code-splitting) | [打开 →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/code-splitting) |
| shadow-dom | [打开 →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/shadow-dom) | [打开 →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/shadow-dom) |

详见 [examples/](./examples)。

## 安装

```bash
# 使用 pnpm
$ pnpm install -D rollup-plugin-require-css

# 使用 npm
$ npm install -D rollup-plugin-require-css

# 使用 yarn
$ yarn add -D rollup-plugin-require-css
```

## 用法

### 基础用法

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
// 自动检测 .module.css 文件
import styles from './button.module.css'

console.log(styles.button) // "_button_x5f2a"

// 或强制对所有 CSS 启用
requireCSS({ modules: true })
```

### 使用预处理器

```js
// 先安装预处理器
// pnpm add -D sass

import './styles.scss'
import './theme.less'
import './base.styl'

// 在 rollup.config.js 中配置
requireCSS({
  preprocessor: {
    sass: { includePaths: ['src/styles'] },
    less: { paths: ['src/styles'] },
    stylus: { paths: ['src/styles'] }
  }
})
```

### 使用 PostCSS

```js
// 安装 postcss 和插件
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
  sourcemap: true,      // 生成内联 Source Map
  sourcemap: 'inline',  // 内联 Source Map
  sourcemap: 'external' // 外部 .css.map 文件
})
```

### 代码分割

```js
export default {
  input: ['src/a.js', 'src/b.js'],
  output: { dir: 'dist', format: 'es' },
  plugins: [
    requireCSS({
      split: true,  // 每个入口生成独立 CSS
      output: (chunk) => `${chunk.name}.css`
    })
  ]
}
```

### Shadow DOM 支持

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

## 配置选项

### `output`

- 类型：`string | ((chunk: OutputInfo) => string)`
- 默认值：从输出文件名自动检测

CSS 输出文件名或返回文件名的函数。

### `inject`

- 类型：`boolean`
- 默认值：`false`

将 CSS 注入到 bundle 中或提取为单独文件。

### `minify`

- 类型：`boolean | MinifyOptions`
- 默认值：`false`

启用 CSS 压缩，支持细粒度控制：

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

- 类型：`boolean | CSSModulesOptions`
- 默认值：`{ enabled: 'auto' }`

启用 CSS Modules：

```js
requireCSS({
  modules: {
    enabled: true, // 或 'auto'
    generateScopedName: (name, filename, css) => `_${name}_${hash(css)}`,
    globalModulePaths: [/global\.css$/]
  }
})
```

### `postcss`

- 类型：`PostCSSOptions`

配置 PostCSS 集成：

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

- 类型：`PreprocessorOptions`

配置预处理器支持：

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

- 类型：`boolean | 'inline' | 'external'`
- 默认值：`false`

为 CSS 生成 Source Map。

### `split`

- 类型：`boolean`
- 默认值：`false`

为多入口启用 CSS 代码分割。

### `hmr`

- 类型：`boolean`
- 默认值：`false`

启用热模块替换支持。

### `cache`

- 类型：`boolean | CacheOptions`
- 默认值：`false`

启用缓存加速重新构建：

```js
requireCSS({
  cache: {
    enabled: true,
    dir: '.cache/css',
    ttl: 3600000 // 1 小时
  }
})
```

### `transform`

- 类型：`(code: string, id: string) => string | Promise<string>`

自定义 CSS 转换函数。

### `onExtract`

- 类型：`(css: string, chunk: OutputInfo) => void`

CSS 提取时的回调函数。

## 插件 API

通过 `api` 属性访问插件内部：

```js
const plugin = requireCSS()

// 获取所有收集的样式
plugin.api.getStyles()

// 获取 CSS Modules 类名映射
plugin.api.getCSSModules()

// 获取特定类名
plugin.api.getClassName('/path/to/file.css', 'button')

// 获取统计信息
plugin.api.getStats()

// 清除缓存
plugin.api.clearCache()
```

## 问题反馈

请在 [这里](https://github.com/saqqdy/rollup-plugin-require-css/issues) 提交问题。

## 许可证

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/rollup-plugin-require-css.svg?style=flat-square
[npm-url]: https://npmjs.org/package/rollup-plugin-require-css
[download-image]: https://img.shields.io/npm/dm/rollup-plugin-require-css.svg?style=flat-square
[download-url]: https://npmjs.org/package/rollup-plugin-require-css
