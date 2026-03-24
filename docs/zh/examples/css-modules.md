# CSS Modules 示例

本示例演示 CSS Modules 与作用域类名。

## 测试功能

- CSS Modules 自动检测
- 作用域类名
- 类名组合

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
      output: 'dist/style.css',
      modules: {
        enabled: 'auto',
        generateScopedName: (name, filename) => {
          const component = filename.split('/').slice(-2)[0]
          return `${component}__${name}`
        }
      }
    })
  ]
}
```

## 源代码

::: details src/index.js
```js
import styles from './button.module.css'

export function Button() {
  const button = document.createElement('button')
  button.className = `${styles.button} ${styles.primary}`
  button.textContent = '点击我'
  return button
}

console.log('Button class:', styles.button)
console.log('Primary class:', styles.primary)
```
:::

::: details src/button.module.css
```css
.button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primary {
  background-color: #3b82f6;
  color: white;
}

.primary:hover {
  background-color: #2563eb;
}

/* 从其他类组合 */
.large {
  composes: button;
  padding: 12px 24px;
  font-size: 1.1em;
}
```
:::

## 试一试

```bash
cd examples/css-modules
pnpm install
pnpm run build
```

## 输出

**dist/index.js**
```js
var styles = {
  button: 'button__button',
  primary: 'button__primary',
  large: 'button__large button__button'
};

function Button() {
  const button = document.createElement('button');
  button.className = `${styles.button} ${styles.primary}`;
  button.textContent = '点击我';
  return button;
}

export { Button };
```

**dist/style.css**
```css
.button__button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button__primary {
  background-color: #3b82f6;
  color: white;
}

.button__primary:hover {
  background-color: #2563eb;
}

.button__large {
  padding: 12px 24px;
  font-size: 1.1em;
}
```

## 在线试用

- [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/css-modules)
- [CodeSandbox](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/css-modules)
