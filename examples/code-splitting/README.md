# Code Splitting Example / 代码分割示例

[English](#english) | [中文](#中文)

---

<a name="english"></a>

## English

CSS code splitting for multi-entry builds.

### Features

- Multi-entry support
- CSS code splitting
- Separate CSS per entry point

### Online Demo

| Platform | Link |
|----------|------|
| CodeSandbox | [Open →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/code-splitting) |
| StackBlitz | [Open →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/code-splitting) |

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
  input: ['src/app.js', 'src/admin.js'],
  output: { dir: 'dist', format: 'es' },
  plugins: [
    requireCSS({
      split: true,
      output: (chunk) => `${chunk.name}.css`
    })
  ]
}
```

### Build Output

```
dist/
├── app.js      # App entry JS
├── app.css     # App entry CSS
├── admin.js    # Admin entry JS
└── admin.css   # Admin entry CSS
```

### Entry Points

- **app.html** - Loads `app.css` only
- **admin.html** - Loads `admin.css` only

---

<a name="中文"></a>

## 中文

多入口构建的 CSS 代码分割。

### 功能特性

- 多入口支持
- CSS 代码分割
- 每个入口点独立的 CSS

### 在线体验

| 平台 | 链接 |
|------|------|
| CodeSandbox | [打开 →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/code-splitting) |
| StackBlitz | [打开 →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/code-splitting) |

### 本地开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 浏览器打开
open index.html
```
