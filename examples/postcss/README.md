# PostCSS Example / PostCSS 示例

[English](#english) | [中文](#中文)

---

<a name="english"></a>

## English

PostCSS integration with autoprefixer for browser compatibility.

### Features

- PostCSS integration
- Autoprefixer for vendor prefixes
- Browser compatibility

### Online Demo

| Platform | Link |
|----------|------|
| CodeSandbox | [Open →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/postcss) |
| StackBlitz | [Open →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/postcss) |

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
import autoprefixer from 'autoprefixer'

export default {
  input: 'src/index.js',
  output: { file: 'dist/index.js', format: 'es' },
  plugins: [
    requireCSS({
      output: 'styles.css',
      postcss: {
        enabled: true,
        plugins: [autoprefixer()]
      }
    })
  ]
}
```

### Dependencies

```bash
pnpm add -D postcss autoprefixer
```

### Browser Support

The autoprefixer will automatically add vendor prefixes for:
- Flexbox (`display: flex`, `gap`)
- CSS Grid
- Backdrop filter
- And more based on browserslist config

---

<a name="中文"></a>

## 中文

PostCSS 集成 autoprefixer 实现浏览器兼容性。

### 功能特性

- PostCSS 集成
- Autoprefixer 自动添加厂商前缀
- 浏览器兼容性

### 在线体验

| 平台 | 链接 |
|------|------|
| CodeSandbox | [打开 →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/postcss) |
| StackBlitz | [打开 →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/postcss) |

### 本地开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 浏览器打开
open index.html
```
