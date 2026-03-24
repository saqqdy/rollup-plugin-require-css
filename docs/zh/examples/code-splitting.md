# 代码分割示例

本示例演示多入口点的 CSS 代码分割。

## 测试功能

- 多入口点
- CSS 代码分割
- 按入口输出 CSS

## 配置

```js
import requireCSS from 'rollup-plugin-require-css'

export default {
  input: ['src/app.js', 'src/admin.js'],
  output: {
    dir: 'dist',
    format: 'es'
  },
  plugins: [
    requireCSS({
      split: true,
      output: (chunk) => `${chunk.name}.css`
    })
  ]
}
```

## 源代码

::: details src/app.js
```js
import './styles/app.css'

export function initApp() {
  console.log('App 已初始化')
}
```
:::

::: details src/admin.js
```js
import './styles/admin.css'

export function initAdmin() {
  console.log('Admin 已初始化')
}
```
:::

::: details src/styles/app.css
```css
.app-header {
  background: #3b82f6;
  padding: 16px;
}

.app-content {
  max-width: 1200px;
  margin: 0 auto;
}
```
:::

::: details src/styles/admin.css
```css
.admin-panel {
  background: #1f2937;
  color: white;
}

.admin-sidebar {
  width: 250px;
  min-height: 100vh;
}
```
:::

## 试一试

```bash
cd examples/code-splitting
pnpm install
pnpm run build
```

## 输出

```
dist/
├── app.js
├── app.css
├── admin.js
└── admin.css
```

**dist/app.css**
```css
.app-header {
  background: #3b82f6;
  padding: 16px;
}

.app-content {
  max-width: 1200px;
  margin: 0 auto;
}
```

**dist/admin.css**
```css
.admin-panel {
  background: #1f2937;
  color: white;
}

.admin-sidebar {
  width: 250px;
  min-height: 100vh;
}
```

## 共享 CSS

当多个入口共享 CSS 时，可以配置共享 chunk：

```js
requireCSS({
  split: true,
  output: (chunk) => {
    if (chunk.isEntry) {
      return `${chunk.name}.css`
    }
    return `shared/${chunk.name}.css`
  }
})
```

## 在线试用

- [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/code-splitting)
- [CodeSandbox](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/code-splitting)
