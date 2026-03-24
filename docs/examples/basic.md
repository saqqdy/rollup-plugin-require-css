# Basic Example

This example demonstrates basic CSS import and bundling.

## Features Tested

- CSS import
- CSS bundling
- Minification
- Source maps

## Configuration

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

## Source Code

::: details src/index.js
```js
import './styles.css'

export function createButton() {
  const button = document.createElement('button')
  button.className = 'btn btn-primary'
  button.textContent = 'Click me'
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

## Try It

```bash
cd examples/basic
pnpm install
pnpm run build
```

## Output

**dist/style.css**
```css
.btn{padding:8px 16px;border:none;border-radius:4px;cursor:pointer}.btn-primary{background-color:#3b82f6;color:#fff}.btn-primary:hover{background-color:#2563eb}
/*# sourceMappingURL=style.css.map */
```

## Try Online

- [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/basic)
- [CodeSandbox](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/basic)
