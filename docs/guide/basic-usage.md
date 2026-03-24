# Basic Usage

## Importing CSS

Import CSS files directly in your JavaScript:

```js
// src/index.js
import './styles.css'
import './theme.scss'
```

```js
// rollup.config.js
import requireCSS from 'rollup-plugin-require-css'

export default {
  input: 'src/index.js',
  output: { file: 'dist/index.js', format: 'es' },
  plugins: [
    requireCSS({ output: 'dist/style.css' })
  ]
}
```

## CSS Modules

CSS Modules are automatically enabled for `.module.css` files:

```js
// Auto-detect .module.css files
import styles from './button.module.css'

console.log(styles.button) // "_button_x5f2a"
```

Or force enable for all CSS:

```js
requireCSS({ modules: true })
```

### CSS Module Example

**button.module.css**
```css
.button {
  padding: 8px 16px;
  border-radius: 4px;
}
.primary {
  background: blue;
  color: white;
}
```

**button.js**
```js
import styles from './button.module.css'

export function Button() {
  const button = document.createElement('button')
  button.className = `${styles.button} ${styles.primary}`
  return button
}
```

## With Preprocessors

The plugin supports Sass/SCSS, Less, and Stylus out of the box:

```bash
# Install your preferred preprocessor
pnpm add -D sass
# or
pnpm add -D less
# or
pnpm add -D stylus
```

```js
import './styles.scss'
import './theme.less'
import './base.styl'
```

Configure preprocessor options:

```js
requireCSS({
  preprocessor: {
    sass: { includePaths: ['src/styles'] },
    less: { paths: ['src/styles'] },
    stylus: { paths: ['src/styles'] }
  }
})
```

## With PostCSS

Use PostCSS plugins like autoprefixer:

```bash
pnpm add -D postcss autoprefixer
```

```js
requireCSS({
  postcss: {
    enabled: true,
    plugins: [
      require('autoprefixer')()
    ]
  }
})
```

## Source Maps

Generate source maps for CSS:

```js
requireCSS({
  sourcemap: true,      // Generate inline source map
  sourcemap: 'inline',  // Inline source map
  sourcemap: 'external' // External .css.map file
})
```

## Output Options

### Single Output

```js
requireCSS({
  output: 'style.css'
})
```

### Dynamic Output Name

```js
requireCSS({
  output: (chunk) => `${chunk.name}.css`
})
```

## Minification

Enable CSS minification:

```js
requireCSS({
  minify: true
})
```

With fine-grained control:

```js
requireCSS({
  minify: {
    removeComments: true,
    collapseWhitespace: true,
    removeRedundantValues: true,
    mergeRules: false,
    optimizeSelectors: false
  }
})
```
