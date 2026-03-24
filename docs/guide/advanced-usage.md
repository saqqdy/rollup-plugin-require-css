# Advanced Usage

## Code Splitting

Split CSS by entry points for better caching:

```js
export default {
  input: ['src/a.js', 'src/b.js'],
  output: { dir: 'dist', format: 'es' },
  plugins: [
    requireCSS({
      split: true,
      output: (chunk) => `${chunk.name}.css`
    })
  ]
}
```

This generates:
- `dist/a.js` + `dist/a.css`
- `dist/b.js` + `dist/b.css`

## Inject CSS

Inject CSS directly into the JavaScript bundle instead of extracting:

```js
requireCSS({
  inject: true
})
```

This is useful for small CSS files or components.

## Shadow DOM Support

Import CSS as a constructable stylesheet for Shadow DOM:

```js
import styles from './component.css' assert { type: 'css' }

class MyElement extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.adoptedStyleSheets = [styles]
  }
}

customElements.define('my-element', MyElement)
```

Enable in config:

```js
requireCSS({
  inject: false,
  // CSS will be exported as constructable stylesheet
})
```

## Caching

Enable caching for faster rebuilds:

```js
requireCSS({
  cache: {
    enabled: true,
    dir: '.cache/css',
    ttl: 3600000 // 1 hour in milliseconds
  }
})
```

## Hot Module Replacement

Enable HMR for development:

```js
requireCSS({
  hmr: true
})
```

## Custom Transform

Apply custom transformations to CSS:

```js
requireCSS({
  transform: (code, id) => {
    // Replace CSS variables
    return code.replace(/--primary-color/g, '--brand-color')
  }
})
```

Async transform:

```js
requireCSS({
  transform: async (code, id) => {
    const processed = await someAsyncProcess(code)
    return processed
  }
})
```

## Extract Callback

Hook into the CSS extraction process:

```js
requireCSS({
  onExtract: (css, chunk) => {
    console.log(`Extracted ${css.length} bytes for ${chunk.name}`)
    // You can also modify the CSS by returning a new string
  }
})
```

## Plugin API

Access plugin internals at runtime:

```js
const plugin = requireCSS()

// Use in build
export default {
  plugins: [plugin]
}

// Access API after build
const styles = plugin.api.getStyles()
const modules = plugin.api.getCSSModules()
const stats = plugin.api.getStats()
```

See [Plugin API](/api/plugin-api) for full documentation.

## Integration with Other Tools

### With Vite

```js
// vite.config.js
import requireCSS from 'rollup-plugin-require-css'

export default {
  build: {
    rollupOptions: {
      plugins: [requireCSS()]
    }
  }
}
```

### With TypeScript

```js
import typescript from '@rollup/plugin-typescript'
import requireCSS from 'rollup-plugin-require-css'

export default {
  plugins: [
    typescript(),
    requireCSS()
  ]
}
```

### With Node Resolve

```js
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import requireCSS from 'rollup-plugin-require-css'

export default {
  plugins: [
    nodeResolve(),
    commonjs(),
    requireCSS()
  ]
}
```

## CSS Modules Configuration

Fine-tune CSS Modules behavior:

```js
requireCSS({
  modules: {
    enabled: true, // or 'auto'
    generateScopedName: (name, filename, css) => {
      return `_${name}_${hash(css)}`
    },
    globalModulePaths: [/global\.css$/]
  }
})
```

### Custom Scope Name

```js
requireCSS({
  modules: {
    generateScopedName: (localName, resourcePath) => {
      const componentName = path.basename(path.dirname(resourcePath))
      return `${componentName}__${localName}`
    }
  }
})
```

### Global CSS Files

Exclude certain files from CSS Modules:

```js
requireCSS({
  modules: {
    enabled: true,
    globalModulePaths: [
      /global\.css$/,
      /normalize\.css$/,
      /variables\.css$/
    ]
  }
})
```
