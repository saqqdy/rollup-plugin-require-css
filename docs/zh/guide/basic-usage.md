# 基础用法

## 导入 CSS

在 JavaScript 中直接导入 CSS 文件：

```js
// src/index.js
import './styles.css'
import './theme.scss'
```

```js
// rollup.config.js
import requireCSS from 'rollup-plugin-require-css'

export default {
  input: 'src/index.js',
  output: { file: 'dist/index.js', format: 'es' },
  plugins: [
    requireCSS({ output: 'dist/style.css' })
  ]
}
```

## CSS Modules

`.module.css` 文件会自动启用 CSS Modules：

```js
// 自动检测 .module.css 文件
import styles from './button.module.css'

console.log(styles.button) // "_button_x5f2a"
```

或者对所有 CSS 强制启用：

```js
requireCSS({ modules: true })
```

### CSS Module 示例

**button.module.css**
```css
.button {
  padding: 8px 16px;
  border-radius: 4px;
}
.primary {
  background: blue;
  color: white;
}
```

**button.js**
```js
import styles from './button.module.css'

export function Button() {
  const button = document.createElement('button')
  button.className = `${styles.button} ${styles.primary}`
  return button
}
```

## 使用预处理器

插件开箱即支持 Sass/SCSS、Less 和 Stylus：

```bash
# 安装你需要的预处理器
pnpm add -D sass
# 或
pnpm add -D less
# 或
pnpm add -D stylus
```

```js
import './styles.scss'
import './theme.less'
import './base.styl'
```

配置预处理器选项：

```js
requireCSS({
  preprocessor: {
    sass: { includePaths: ['src/styles'] },
    less: { paths: ['src/styles'] },
    stylus: { paths: ['src/styles'] }
  }
})
```

## 使用 PostCSS

使用 PostCSS 插件如 autoprefixer：

```bash
pnpm add -D postcss autoprefixer
```

```js
requireCSS({
  postcss: {
    enabled: true,
    plugins: [
      require('autoprefixer')()
    ]
  }
})
```

## Source Maps

为 CSS 生成 source maps：

```js
requireCSS({
  sourcemap: true,      // 生成内联 source map
  sourcemap: 'inline',  // 内联 source map
  sourcemap: 'external' // 外部 .css.map 文件
})
```

## 输出选项

### 单一输出

```js
requireCSS({
  output: 'style.css'
})
```

### 动态输出名称

```js
requireCSS({
  output: (chunk) => `${chunk.name}.css`
})
```

## 压缩

启用 CSS 压缩：

```js
requireCSS({
  minify: true
})
```

精细化控制：

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
