# Basic Example / 基础示例

[English](#english) | [中文](#中文)

---

<a name="english"></a>

## English

Basic CSS import and bundling with minification and source maps.

### Features

- CSS import and bundling
- CSS minification
- Source map generation

### Online Demo

| Platform | Link |
|----------|------|
| CodeSandbox | [Open →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/basic) |
| StackBlitz | [Open →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/basic) |

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
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    requireCSS({
      output: 'style.css',
      minify: true,
      sourcemap: true
    })
  ]
}
```

---

<a name="中文"></a>

## 中文

基础 CSS 导入和打包，包含压缩和 Source Map 生成。

### 功能特性

- CSS 导入和打包
- CSS 压缩
- Source Map 生成

### 在线体验

| 平台 | 链接 |
|------|------|
| CodeSandbox | [打开 →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/basic) |
| StackBlitz | [打开 →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/basic) |

### 本地开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 浏览器打开
open index.html
```
