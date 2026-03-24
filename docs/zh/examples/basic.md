# 基础示例

本示例演示基础的 CSS 导入和打包。

## 测试功能

- CSS 导入
- CSS 打包
- 压缩
- Source maps

## 配置

```js
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
      output: 'dist/style.css',
      minify: true,
      sourcemap: true
    })
  ]
}
```

## 源代码

::: details src/index.js
```js
import './styles.css'

export function createButton() {
  const button = document.createElement('button')
  button.className = 'btn btn-primary'
  button.textContent = '点击我'
  return button
}
```
:::

::: details src/styles.css
```css
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}
```
:::

## 试一试

```bash
cd examples/basic
pnpm install
pnpm run build
```

## 输出

**dist/style.css**
```css
.btn{padding:8px 16px;border:none;border-radius:4px;cursor:pointer}.btn-primary{background-color:#3b82f6;color:#fff}.btn-primary:hover{background-color:#2563eb}
/*# sourceMappingURL=style.css.map */
```

## 在线试用

- [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/basic)
- [CodeSandbox](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/basic)
