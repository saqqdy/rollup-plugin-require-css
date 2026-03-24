# 选项

## output

- **类型**: `string | ((chunk: OutputInfo) => string)`
- **默认值**: 从输出文件名自动检测

CSS 输出文件名或返回文件名的函数。

```js
// 静态文件名
requireCSS({ output: 'style.css' })

// 动态文件名
requireCSS({
  output: (chunk) => `${chunk.name}.css`
})
```

`chunk` 对象包含：
- `name` - Chunk 名称
- `isEntry` - 是否为入口 chunk
- `modules` - 模块 ID 列表

---

## inject

- **类型**: `boolean`
- **默认值**: `false`

将 CSS 注入打包文件或提取为单独文件。

```js
// 将 CSS 作为 style 标签注入
requireCSS({ inject: true })

// 提取为单独文件（默认）
requireCSS({ inject: false })
```

---

## minify

- **类型**: `boolean | MinifyOptions`
- **默认值**: `false`

启用 CSS 压缩，支持精细控制：

```js
// 简单启用
requireCSS({ minify: true })

// 带选项
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

### MinifyOptions

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `removeComments` | `boolean` | `true` | 移除 CSS 注释 |
| `collapseWhitespace` | `boolean` | `true` | 折叠空白 |
| `removeRedundantValues` | `boolean` | `true` | 移除冗余值 |
| `mergeRules` | `boolean` | `false` | 合并相似规则 |
| `optimizeSelectors` | `boolean` | `false` | 优化选择器 |

---

## modules

- **类型**: `boolean | CSSModulesOptions`
- **默认值**: `{ enabled: 'auto' }`

启用 CSS Modules：

```js
// 对所有 CSS 启用
requireCSS({ modules: true })

// 自动检测 .module.css 文件
requireCSS({ modules: { enabled: 'auto' } })

// 完整配置
requireCSS({
  modules: {
    enabled: true,
    generateScopedName: (name, filename, css) => `_${name}_${hash(css)}`,
    globalModulePaths: [/global\.css$/]
  }
})
```

### CSSModulesOptions

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean \| 'auto'` | `'auto'` | 启用模式 |
| `generateScopedName` | `function` | - | 自定义作用域名称生成器 |
| `globalModulePaths` | `RegExp[]` | `[]` | 全局 CSS 的匹配模式 |

---

## postcss

- **类型**: `PostCSSOptions`

配置 PostCSS 集成：

```js
requireCSS({
  postcss: {
    enabled: true,
    plugins: [
      require('autoprefixer')()
    ],
    options: {
      // PostCSS 处理选项
    }
  }
})
```

### PostCSSOptions

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 启用 PostCSS |
| `plugins` | `Plugin[]` | `[]` | PostCSS 插件 |
| `options` | `object` | `{}` | 处理选项 |

---

## preprocessor

- **类型**: `PreprocessorOptions`

配置预处理器支持：

```js
requireCSS({
  preprocessor: {
    sass: {
      includePaths: ['src/styles'],
      silenceDeprecations: ['legacy-js-api']
    },
    less: {
      paths: ['src/styles'],
      modifyVars: { primary: '#3b82f6' }
    },
    stylus: {
      paths: ['src/styles'],
      define: { primary: '#3b82f6' }
    }
  }
})
```

### PreprocessorOptions

每个预处理器接受其原生配置选项：

| 预处理器 | 键 | 说明 |
|----------|-----|------|
| Sass/SCSS | `sass` | Sass API 选项 |
| Less | `less` | Less 选项 |
| Stylus | `stylus` | Stylus 选项 |

---

## sourcemap

- **类型**: `boolean | 'inline' | 'external'`
- **默认值**: `false`

为 CSS 生成 source maps：

```js
requireCSS({ sourcemap: true })      // 自动（跟随 Rollup 配置）
requireCSS({ sourcemap: 'inline' })  // 内联 source map
requireCSS({ sourcemap: 'external' }) // 外部 .css.map 文件
```

---

## split

- **类型**: `boolean`
- **默认值**: `false`

为多入口点启用 CSS 代码分割：

```js
export default {
  input: ['src/a.js', 'src/b.js'],
  output: { dir: 'dist', format: 'es' },
  plugins: [
    requireCSS({
      split: true,
      output: (chunk) => `${chunk.name}.css`
    })
  ]
}
```

---

## hmr

- **类型**: `boolean`
- **默认值**: `false`

启用热模块替换支持：

```js
requireCSS({ hmr: true })
```

---

## cache

- **类型**: `boolean | CacheOptions`
- **默认值**: `false`

启用缓存以加快重建速度：

```js
requireCSS({
  cache: {
    enabled: true,
    dir: '.cache/css',
    ttl: 3600000 // 1 小时
  }
})
```

### CacheOptions

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 启用缓存 |
| `dir` | `string` | `.cache/css` | 缓存目录 |
| `ttl` | `number` | `3600000` | 存活时间（毫秒） |

---

## transform

- **类型**: `(code: string, id: string) => string | Promise<string>`

CSS 处理的自定义转换函数：

```js
requireCSS({
  transform: (code, id) => {
    // 替换变量
    return code.replace(/--primary/g, '--brand')
  }
})
```

---

## onExtract

- **类型**: `(css: string, chunk: OutputInfo) => void | string`

CSS 提取时的回调。返回字符串可修改输出：

```js
requireCSS({
  onExtract: (css, chunk) => {
    console.log(`CSS 大小: ${css.length} 字节`)
    // 可选返回修改后的 CSS
    return css.replace(/\/\*.*?\*\//g, '')
  }
})
```
