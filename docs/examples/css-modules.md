# CSS Modules Example

This example demonstrates CSS Modules with scoped class names.

## Features Tested

- CSS Modules auto-detection
- Scoped class names
- Class name composition

## Configuration

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

## Source Code

::: details src/index.js
```js
import styles from './button.module.css'

export function Button() {
  const button = document.createElement('button')
  button.className = `${styles.button} ${styles.primary}`
  button.textContent = 'Click me'
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

/* Compose from other classes */
.large {
  composes: button;
  padding: 12px 24px;
  font-size: 1.1em;
}
```
:::

## Try It

```bash
cd examples/css-modules
pnpm install
pnpm run build
```

## Output

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
  button.textContent = 'Click me';
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

## Try Online

- [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/css-modules)
- [CodeSandbox](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/css-modules)
