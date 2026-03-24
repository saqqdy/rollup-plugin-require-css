# 进阶用法

## 代码分割

按入口点分割 CSS 以获得更好的缓存：

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

这将生成：
- `dist/a.js` + `dist/a.css`
- `dist/b.js` + `dist/b.css`

## 注入 CSS

将 CSS 直接注入到 JavaScript 打包文件中而不是提取：

```js
requireCSS({
  inject: true
})
```

这对于小型 CSS 文件或组件很有用。

## Shadow DOM 支持

将 CSS 作为可构造样式表导入用于 Shadow DOM：

```js
import styles from './component.css' assert { type: 'css' }

class MyElement extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.adoptedStyleSheets = [styles]
  }
}

customElements.define('my-element', MyElement)
```

在配置中启用：

```js
requireCSS({
  inject: false,
  // CSS 将作为可构造样式表导出
})
```

## 缓存

启用缓存以加快重建速度：

```js
requireCSS({
  cache: {
    enabled: true,
    dir: '.cache/css',
    ttl: 3600000 // 1 小时（毫秒）
  }
})
```

## 热模块替换

为开发环境启用 HMR：

```js
requireCSS({
  hmr: true
})
```

## 自定义转换

对 CSS 应用自定义转换：

```js
requireCSS({
  transform: (code, id) => {
    // 替换 CSS 变量
    return code.replace(/--primary-color/g, '--brand-color')
  }
})
```

异步转换：

```js
requireCSS({
  transform: async (code, id) => {
    const processed = await someAsyncProcess(code)
    return processed
  }
})
```

## 提取回调

钩入 CSS 提取过程：

```js
requireCSS({
  onExtract: (css, chunk) => {
    console.log(`为 ${chunk.name} 提取了 ${css.length} 字节`)
    // 也可以通过返回新字符串来修改 CSS
  }
})
```

## 插件 API

在运行时访问插件内部：

```js
const plugin = requireCSS()

// 在构建中使用
export default {
  plugins: [plugin]
}

// 构建后访问 API
const styles = plugin.api.getStyles()
const modules = plugin.api.getCSSModules()
const stats = plugin.api.getStats()
```

完整文档请参阅 [插件 API](/zh/api/plugin-api)。

## 与其他工具集成

### 与 Vite 集成

```js
// vite.config.js
import requireCSS from 'rollup-plugin-require-css'

export default {
  build: {
    rollupOptions: {
      plugins: [requireCSS()]
    }
  }
}
```

### 与 TypeScript 集成

```js
import typescript from '@rollup/plugin-typescript'
import requireCSS from 'rollup-plugin-require-css'

export default {
  plugins: [
    typescript(),
    requireCSS()
  ]
}
```

### 与 Node Resolve 集成

```js
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import requireCSS from 'rollup-plugin-require-css'

export default {
  plugins: [
    nodeResolve(),
    commonjs(),
    requireCSS()
  ]
}
```

## CSS Modules 配置

微调 CSS Modules 行为：

```js
requireCSS({
  modules: {
    enabled: true, // 或 'auto'
    generateScopedName: (name, filename, css) => {
      return `_${name}_${hash(css)}`
    },
    globalModulePaths: [/global\.css$/]
  }
})
```

### 自定义作用域名

```js
requireCSS({
  modules: {
    generateScopedName: (localName, resourcePath) => {
      const componentName = path.basename(path.dirname(resourcePath))
      return `${componentName}__${localName}`
    }
  }
})
```

### 全局 CSS 文件

将某些文件从 CSS Modules 中排除：

```js
requireCSS({
  modules: {
    enabled: true,
    globalModulePaths: [
      /global\.css$/,
      /normalize\.css$/,
      /variables\.css$/
    ]
  }
})
```
