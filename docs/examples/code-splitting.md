# Code Splitting Example

This example demonstrates CSS code splitting for multiple entry points.

## Features Tested

- Multiple entry points
- CSS code splitting
- Per-entry CSS output

## Configuration

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

## Source Code

::: details src/app.js
```js
import './styles/app.css'

export function initApp() {
  console.log('App initialized')
}
```
:::

::: details src/admin.js
```js
import './styles/admin.css'

export function initAdmin() {
  console.log('Admin initialized')
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

## Try It

```bash
cd examples/code-splitting
pnpm install
pnpm run build
```

## Output

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

## Shared CSS

When multiple entries share CSS, you can configure shared chunks:

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

## Try Online

- [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/code-splitting)
- [CodeSandbox](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/code-splitting)
