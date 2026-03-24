# CSS Modules Example / CSS Modules 示例

[English](#english) | [中文](#中文)

---

<a name="english"></a>

## English

CSS Modules with scoped class names and custom name generator.

### Features

- Auto-detect `.module.css` files
- Scoped class names
- Custom `generateScopedName` function

### Online Demo

| Platform | Link |
|----------|------|
| CodeSandbox | [Open →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/css-modules) |
| StackBlitz | [Open →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/css-modules) |

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
      modules: {
        enabled: 'auto',
        generateScopedName: (name, filename) => {
          const hash = filename.split('/').pop().split('.')[0]
          return `_${name}_${hash}`
        }
      }
    })
  ]
}
```

### Usage

```js
// Import CSS modules
import buttonStyles from './button.module.css'
import cardStyles from './card.module.css'

// Use scoped class names
console.log(buttonStyles.button) // "_button_button"
console.log(buttonStyles.primary) // "_primary_button"
```

---

<a name="中文"></a>

## 中文

CSS Modules 作用域类名和自定义名称生成器。

### 功能特性

- 自动检测 `.module.css` 文件
- 作用域类名
- 自定义 `generateScopedName` 函数

### 在线体验

| 平台 | 链接 |
|------|------|
| CodeSandbox | [打开 →](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/css-modules) |
| StackBlitz | [打开 →](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css?file=examples/css-modules) |

### 本地开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 浏览器打开
open index.html
```
