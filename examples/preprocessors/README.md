# Preprocessors Example / 预处理器示例

[English](#english) | [中文](#中文)

---

<a name="english"></a>

## English

Sass/SCSS, Less, and Stylus preprocessor support.

### Features

- Sass/SCSS support
- Less support
- Stylus support
- Custom include paths

### Online Demo

| Platform | Link |
|----------|------|
| CodeSandbox | [Open →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/preprocessors) |
| StackBlitz | [Open →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/preprocessors) |

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
      output: 'styles.css',
      preprocessor: {
        sass: { includePaths: ['src/styles'] },
        less: { paths: ['src/styles'] },
        stylus: { paths: ['src/styles'] }
      }
    })
  ]
}
```

### Usage

```js
// Import preprocessor files
import './styles/theme.scss'
import './styles/base.less'
import './styles/footer.styl'
```

### Dependencies

```bash
# Install preprocessors as needed
pnpm add -D sass    # for SCSS
pnpm add -D less    # for Less
pnpm add -D stylus  # for Stylus
```

---

<a name="中文"></a>

## 中文

Sass/SCSS、Less 和 Stylus 预处理器支持。

### 功能特性

- Sass/SCSS 支持
- Less 支持
- Stylus 支持
- 自定义 include 路径

### 在线体验

| 平台 | 链接 |
|------|------|
| CodeSandbox | [打开 →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/preprocessors) |
| StackBlitz | [打开 →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/preprocessors) |

### 本地开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 浏览器打开
open index.html
```
