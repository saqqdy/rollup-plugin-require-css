# Shadow DOM Example / Shadow DOM 示例

[English](#english) | [中文](#中文)

---

<a name="english"></a>

## English

CSSStyleSheet usage for Shadow DOM components with style isolation.

### Features

- CSSStyleSheet support
- Shadow DOM style isolation
- `adoptedStyleSheets` API

### Online Demo

| Platform | Link |
|----------|------|
| CodeSandbox | [Open →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/shadow-dom) |
| StackBlitz | [Open →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/shadow-dom) |

### Local Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Open in browser
open index.html
```

### Configuration

```js
// rollup.config.js
import requireCSS from 'rollup-plugin-require-css'

export default {
  input: 'src/index.js',
  output: { file: 'dist/index.js', format: 'es' },
  plugins: [
    requireCSS({
      output: 'style.css',
      styleSheet: true // Enable CSSStyleSheet export
    })
  ]
}
```

### Usage

```js
// Import CSS as CSSStyleSheet
import styles from './component.css' assert { type: 'css' }

class MyComponent extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    // Use adoptedStyleSheets for style isolation
    shadow.adoptedStyleSheets = [styles]

    shadow.innerHTML = `
      <h2>Shadow DOM Component</h2>
      <p>Styles are isolated from global CSS</p>
    `
  }
}

customElements.define('my-component', MyComponent)
```

### Style Isolation

Shadow DOM provides complete style isolation:
- Global styles don't affect shadow DOM content
- Shadow DOM styles don't leak to global
- Perfect for encapsulated components

---

<a name="中文"></a>

## 中文

CSSStyleSheet 用于 Shadow DOM 组件，实现样式隔离。

### 功能特性

- CSSStyleSheet 支持
- Shadow DOM 样式隔离
- `adoptedStyleSheets` API

### 在线体验

| 平台 | 链接 |
|------|------|
| CodeSandbox | [打开 →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/shadow-dom) |
| StackBlitz | [打开 →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/shadow-dom) |

### 本地开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 浏览器打开
open index.html
```
