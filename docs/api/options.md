# Options

## output

- **Type**: `string | ((chunk: OutputInfo) => string)`
- **Default**: Auto-detect from output file name

CSS output file name or a function that returns the file name.

```js
// Static file name
requireCSS({ output: 'style.css' })

// Dynamic file name
requireCSS({
  output: (chunk) => `${chunk.name}.css`
})
```

The `chunk` object contains:
- `name` - Chunk name
- `isEntry` - Whether it's an entry chunk
- `modules` - List of module IDs

---

## inject

- **Type**: `boolean`
- **Default**: `false`

Inject CSS into the bundle or extract to a separate file.

```js
// Inject CSS as a style tag
requireCSS({ inject: true })

// Extract to separate file (default)
requireCSS({ inject: false })
```

---

## minify

- **Type**: `boolean | MinifyOptions`
- **Default**: `false`

Enable CSS minification with optional fine-grained control:

```js
// Simple enable
requireCSS({ minify: true })

// With options
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

### MinifyOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `removeComments` | `boolean` | `true` | Remove CSS comments |
| `collapseWhitespace` | `boolean` | `true` | Collapse whitespace |
| `removeRedundantValues` | `boolean` | `true` | Remove redundant values |
| `mergeRules` | `boolean` | `false` | Merge similar rules |
| `optimizeSelectors` | `boolean` | `false` | Optimize selectors |

---

## modules

- **Type**: `boolean | CSSModulesOptions`
- **Default**: `{ enabled: 'auto' }`

Enable CSS Modules:

```js
// Enable for all CSS
requireCSS({ modules: true })

// Auto-detect .module.css files
requireCSS({ modules: { enabled: 'auto' } })

// Full configuration
requireCSS({
  modules: {
    enabled: true,
    generateScopedName: (name, filename, css) => `_${name}_${hash(css)}`,
    globalModulePaths: [/global\.css$/]
  }
})
```

### CSSModulesOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean \| 'auto'` | `'auto'` | Enable mode |
| `generateScopedName` | `function` | - | Custom scope name generator |
| `globalModulePaths` | `RegExp[]` | `[]` | Patterns for global CSS |

---

## postcss

- **Type**: `PostCSSOptions`

Configure PostCSS integration:

```js
requireCSS({
  postcss: {
    enabled: true,
    plugins: [
      require('autoprefixer')()
    ],
    options: {
      // PostCSS process options
    }
  }
})
```

### PostCSSOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable PostCSS |
| `plugins` | `Plugin[]` | `[]` | PostCSS plugins |
| `options` | `object` | `{}` | Process options |

---

## preprocessor

- **Type**: `PreprocessorOptions`

Configure preprocessor support:

```js
requireCSS({
  preprocessor: {
    sass: {
      includePaths: ['src/styles'],
      silenceDeprecations: ['legacy-js-api']
    },
    less: {
      paths: ['src/styles'],
      modifyVars: { primary: '#3b82f6' }
    },
    stylus: {
      paths: ['src/styles'],
      define: { primary: '#3b82f6' }
    }
  }
})
```

### PreprocessorOptions

Each preprocessor accepts its native configuration options:

| Preprocessor | Key | Description |
|--------------|-----|-------------|
| Sass/SCSS | `sass` | Sass API options |
| Less | `less` | Less options |
| Stylus | `stylus` | Stylus options |

---

## sourcemap

- **Type**: `boolean | 'inline' | 'external'`
- **Default**: `false`

Generate source maps for CSS:

```js
requireCSS({ sourcemap: true })      // Auto (follows Rollup config)
requireCSS({ sourcemap: 'inline' })  // Inline source map
requireCSS({ sourcemap: 'external' }) // External .css.map file
```

---

## split

- **Type**: `boolean`
- **Default**: `false`

Enable CSS code splitting for multiple entry points:

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

---

## hmr

- **Type**: `boolean`
- **Default**: `false`

Enable Hot Module Replacement support:

```js
requireCSS({ hmr: true })
```

---

## cache

- **Type**: `boolean | CacheOptions`
- **Default**: `false`

Enable caching for faster rebuilds:

```js
requireCSS({
  cache: {
    enabled: true,
    dir: '.cache/css',
    ttl: 3600000 // 1 hour
  }
})
```

### CacheOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable caching |
| `dir` | `string` | `.cache/css` | Cache directory |
| `ttl` | `number` | `3600000` | Time to live (ms) |

---

## transform

- **Type**: `(code: string, id: string) => string | Promise<string>`

Custom transform function for CSS processing:

```js
requireCSS({
  transform: (code, id) => {
    // Replace variables
    return code.replace(/--primary/g, '--brand')
  }
})
```

---

## onExtract

- **Type**: `(css: string, chunk: OutputInfo) => void | string`

Callback when CSS is extracted. Return a string to modify the output:

```js
requireCSS({
  onExtract: (css, chunk) => {
    console.log(`CSS size: ${css.length} bytes`)
    // Optionally return modified CSS
    return css.replace(/\/\*.*?\*\//g, '')
  }
})
```
