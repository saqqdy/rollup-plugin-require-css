# Shadow DOM 示例

本示例演示在 Shadow DOM 中使用 CSS 和可构造样式表。

## 测试功能

- 可构造样式表
- Shadow DOM 集成
- CSS 导入断言

## 配置

```js
import requireCSS from 'rollup-plugin-require-css'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'es'
  },
  plugins: [
    requireCSS({
      inject: false,
      // CSS 将作为可构造样式表导出
    })
  ]
}
```

## 源代码

::: details src/index.js
```js
import styles from './component.css' assert { type: 'css' }

class MyButton extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    // 采用样式表
    shadow.adoptedStyleSheets = [styles]

    // 创建按钮元素
    const button = document.createElement('button')
    button.className = 'btn'
    button.textContent = this.textContent || '点击我'
    shadow.appendChild(button)
  }
}

customElements.define('my-button', MyButton)
```
:::

::: details src/component.css
```css
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #3b82f6;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.btn:hover {
  background-color: #2563eb;
}

.btn:active {
  background-color: #1d4ed8;
}
```
:::

## 试一试

```bash
cd examples/shadow-dom
pnpm install
pnpm run build
```

## HTML 使用

```html
<!DOCTYPE html>
<html>
<head>
  <title>Shadow DOM 演示</title>
  <script type="module" src="./dist/index.js"></script>
</head>
<body>
  <my-button>自定义按钮</my-button>
</body>
</html>
```

## 多个样式表

你可以在单个组件中使用多个样式表：

```js
import baseStyles from './base.css' assert { type: 'css' }
import themeStyles from './theme.css' assert { type: 'css' }

class MyComponent extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    // 组合多个样式表
    shadow.adoptedStyleSheets = [baseStyles, themeStyles]
  }
}
```

## 共享样式表

可构造样式表的一个优势是可以在多个组件间共享：

```js
import sharedStyles from './shared.css' assert { type: 'css' }

class ComponentA extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.adoptedStyleSheets = [sharedStyles]
  }
}

class ComponentB extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    // 同一个样式表实例 - 高效！
    shadow.adoptedStyleSheets = [sharedStyles]
  }
}
```

## 浏览器支持

可构造样式表支持：
- Chrome 73+
- Edge 79+
- Safari 16.4+
- Firefox 101+

对于旧浏览器，可能需要将样式作为 `<style>` 元素注入：

```js
// 旧浏览器的回退方案
function adoptStyles(shadow, stylesheet) {
  if (shadow.adoptedStyleSheets) {
    shadow.adoptedStyleSheets = [stylesheet]
  } else {
    const style = document.createElement('style')
    style.textContent = /* CSS 内容 */
    shadow.appendChild(style)
  }
}
```

## 在线试用

- [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/shadow-dom)
- [CodeSandbox](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/shadow-dom)
