# Examples / 示例

[English](#english) | [中文](#中文)

---

<a name="english"></a>

## English

This directory contains example projects demonstrating how to use `rollup-plugin-require-css`.

### Online Demo / 在线体验

| Example | CodeSandbox | StackBlitz |
|---------|-------------|------------|
| [basic](./basic) | [Open →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/basic) | [Open →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/basic) |
| [css-modules](./css-modules) | [Open →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/css-modules) | [Open →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/css-modules) |
| [preprocessors](./preprocessors) | [Open →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/preprocessors) | [Open →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/preprocessors) |
| [postcss](./postcss) | [Open →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/postcss) | [Open →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/postcss) |
| [code-splitting](./code-splitting) | [Open →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/code-splitting) | [Open →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/code-splitting) |
| [shadow-dom](./shadow-dom) | [Open →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/shadow-dom) | [Open →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/shadow-dom) |

### Examples Overview

| Example | Description | Features |
|---------|-------------|----------|
| [basic](./basic) | Basic CSS import and bundling | `output`, `minify`, `sourcemap` |
| [css-modules](./css-modules) | CSS Modules with scoped class names | `modules`, `generateScopedName` |
| [preprocessors](./preprocessors) | Sass/Less/Stylus preprocessor support | `preprocessor` |
| [postcss](./postcss) | PostCSS with autoprefixer | `postcss.plugins` |
| [code-splitting](./code-splitting) | Multi-entry CSS code splitting | `split`, `output` function |
| [shadow-dom](./shadow-dom) | Shadow DOM with CSSStyleSheet | `styleSheet`, import assert |

### Quick Start

```bash
# Choose an example and run
cd <example-name>
pnpm install
pnpm build

# Open in browser
open index.html
```

### CSS Loading Methods

The plugin provides two ways to load CSS, **choose one**:

#### Method 1: Extract CSS to file (Recommended)

```html
<!-- Use <link> to load extracted CSS file -->
<link rel="stylesheet" href="./dist/style.css">
```

Benefits:
- CSS loads independently, no JS execution needed
- Better for SEO and initial render

#### Method 2: Auto-inject via JavaScript

```html
<!-- Use <script> to auto-inject CSS -->
<script src="./dist/index.js"></script>
```

Benefits:
- CSS is bundled with JS, fewer HTTP requests
- Useful for components that need CSS modules class mappings

**Note:** Do NOT use both methods at the same time, or CSS will be duplicated.

---

<a name="中文"></a>

## 中文

本目录包含演示如何使用 `rollup-plugin-require-css` 的示例项目。

### 示例概览

| 示例 | 描述 | 功能特性 |
|------|------|----------|
| [basic](./basic) | 基础 CSS 导入和打包 | `output`, `minify`, `sourcemap` |
| [css-modules](./css-modules) | CSS Modules 作用域类名 | `modules`, `generateScopedName` |
| [preprocessors](./preprocessors) | Sass/Less/Stylus 预处理器 | `preprocessor` |
| [postcss](./postcss) | PostCSS + autoprefixer | `postcss.plugins` |
| [code-splitting](./code-splitting) | 多入口 CSS 代码分割 | `split`, `output` 函数 |
| [shadow-dom](./shadow-dom) | Shadow DOM + CSSStyleSheet | `styleSheet`, import assert |

### 快速开始

```bash
# 选择一个示例运行
cd <示例名称>
pnpm install
pnpm build

# 浏览器打开
open index.html
```

### CSS 加载方式

插件提供两种 CSS 加载方式，**二选一**：

#### 方式 1：提取 CSS 文件（推荐）

```html
<!-- 使用 <link> 引入提取的 CSS 文件 -->
<link rel="stylesheet" href="./dist/style.css">
```

优点：
- CSS 独立加载，无需 JS 执行
- 更利于 SEO 和首屏渲染

#### 方式 2：JS 自动注入

```html
<!-- 使用 <script> 自动注入 CSS -->
<script src="./dist/index.js"></script>
```

优点：
- CSS 与 JS 打包在一起，减少 HTTP 请求
- 适用于需要 CSS Modules 类名映射的组件

**注意：** 不要同时使用两种方式，否则 CSS 会重复加载。

---

## Examples Details / 示例详情

### basic

Basic usage with CSS import, minification, and source maps.

```js
// rollup.config.js
requireCss({
  output: 'style.css',
  minify: true
})
```

### css-modules

Demonstrates CSS Modules with auto-detection and custom scoped name generator.

```js
// rollup.config.js
requireCss({
  modules: {
    enabled: 'auto',
    generateScopedName: (name, filename) => `_${name}_${hash}`
  }
})
```

```js
// Usage
import styles from './button.module.css'
console.log(styles.button) // "_button_x5f2a"
```

### preprocessors

Shows how to use Sass/SCSS, Less, and Stylus preprocessors.

```js
// rollup.config.js
requireCss({
  preprocessor: {
    sass: { includePaths: ['src'] },
    less: { paths: ['src'] },
    stylus: { paths: ['src'] }
  }
})
```

```js
// Usage
import './theme.scss'
import './base.less'
import './styles.styl'
```

### postcss

Integrates PostCSS with autoprefixer for browser compatibility.

```js
// rollup.config.js
requireCss({
  postcss: {
    enabled: true,
    plugins: [
      require('autoprefixer')()
    ]
  }
})
```

### code-splitting

Demonstrates CSS code splitting for multi-entry builds.

```js
// rollup.config.js
export default {
  input: ['src/app.js', 'src/admin.js'],
  output: { dir: 'dist', format: 'es' },
  plugins: [
    requireCss({
      split: true,
      output: (chunk) => `${chunk.name}.css`
    })
  ]
}
```

Output:
```
dist/
├── app.js
├── app.css
├── admin.js
└── admin.css
```

### shadow-dom

Shows CSSStyleSheet usage for Shadow DOM components.

```js
// Usage
import styles from './component.css' assert { type: 'css' }

class MyComponent extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.adoptedStyleSheets = [styles]
  }
}
```

## Running All Examples / 运行所有示例

```bash
# From the examples directory
for dir in */; do
  echo "Building $dir..."
  cd "$dir" && pnpm install && pnpm build
  cd ..
done
```
