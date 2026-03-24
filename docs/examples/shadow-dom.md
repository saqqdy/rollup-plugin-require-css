# Shadow DOM Example

This example demonstrates using CSS with Shadow DOM and constructable stylesheets.

## Features Tested

- Constructable stylesheets
- Shadow DOM integration
- CSS import assertions

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
      inject: false,
      // CSS will be exported as constructable stylesheet
    })
  ]
}
```

## Source Code

::: details src/index.js
```js
import styles from './component.css' assert { type: 'css' }

class MyButton extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    // Adopt the stylesheet
    shadow.adoptedStyleSheets = [styles]

    // Create button element
    const button = document.createElement('button')
    button.className = 'btn'
    button.textContent = this.textContent || 'Click me'
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

## Try It

```bash
cd examples/shadow-dom
pnpm install
pnpm run build
```

## HTML Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>Shadow DOM Demo</title>
  <script type="module" src="./dist/index.js"></script>
</head>
<body>
  <my-button>Custom Button</my-button>
</body>
</html>
```

## Multiple Stylesheets

You can use multiple stylesheets in a single component:

```js
import baseStyles from './base.css' assert { type: 'css' }
import themeStyles from './theme.css' assert { type: 'css' }

class MyComponent extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    // Combine multiple stylesheets
    shadow.adoptedStyleSheets = [baseStyles, themeStyles]
  }
}
```

## Shared Stylesheets

One advantage of constructable stylesheets is that they can be shared across multiple components:

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
    // Same stylesheet instance - efficient!
    shadow.adoptedStyleSheets = [sharedStyles]
  }
}
```

## Browser Support

Constructable stylesheets are supported in:
- Chrome 73+
- Edge 79+
- Safari 16.4+
- Firefox 101+

For older browsers, you may need to inject styles as a `<style>` element:

```js
// Fallback for older browsers
function adoptStyles(shadow, stylesheet) {
  if (shadow.adoptedStyleSheets) {
    shadow.adoptedStyleSheets = [stylesheet]
  } else {
    const style = document.createElement('style')
    style.textContent = /* CSS content */
    shadow.appendChild(style)
  }
}
```

## Try Online

- [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/shadow-dom)
- [CodeSandbox](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/shadow-dom)
