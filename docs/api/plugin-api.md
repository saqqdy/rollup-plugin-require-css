# Plugin API

The plugin returns a Rollup plugin instance with an additional `api` property.

## Properties

### name

- **Type**: `string`
- **Value**: `'require-css'`

The plugin name.

```js
const plugin = requireCSS()
console.log(plugin.name) // 'require-css'
```

### version

- **Type**: `string`
- **Value**: Current plugin version

The plugin version.

```js
const plugin = requireCSS()
console.log(plugin.version) // '1.0.0'
```

### api

- **Type**: `PluginApi`

Plugin API for external access.

## API Methods

### getStyles()

Get all collected styles as a map.

- **Returns**: `Map<string, string>`

```js
const plugin = requireCSS()
// After build...
const styles = plugin.api.getStyles()
styles.forEach((css, id) => {
  console.log(`${id}: ${css.length} bytes`)
})
```

### getCSSModules()

Get CSS Modules class mappings.

- **Returns**: `Map<string, Record<string, string>>`

```js
const plugin = requireCSS({ modules: true })
// After build...
const modules = plugin.api.getCSSModules()
modules.forEach((classes, id) => {
  console.log(`${id}:`, classes)
  // { button: '_button_x5f2a', primary: '_primary_abc12' }
})
```

### getClassName()

Get a specific class name from a CSS module.

- **Parameters**:
  - `id` - Module ID (file path)
  - `className` - Original class name
- **Returns**: `string | undefined`

```js
const plugin = requireCSS({ modules: true })
// After build...
const className = plugin.api.getClassName('/src/button.module.css', 'primary')
console.log(className) // '_primary_abc12'
```

### getStats()

Get build statistics.

- **Returns**: `Stats`

```js
const plugin = requireCSS()
// After build...
const stats = plugin.api.getStats()
console.log(stats)
// {
//   filesProcessed: 5,
//   totalSize: 12345,
//   modulesCount: 3,
//   cachedFiles: 2
// }
```

### clearCache()

Clear the plugin cache.

- **Returns**: `void`

```js
const plugin = requireCSS({ cache: true })
plugin.api.clearCache()
```

## TypeScript Types

```typescript
export interface PluginApi {
  getStyles: () => Map<string, string>
  getCSSModules: () => Map<string, Record<string, string>>
  getClassName: (id: string, className: string) => string | undefined
  getStats: () => Stats
  clearCache: () => void
}

export interface Stats {
  filesProcessed: number
  totalSize: number
  modulesCount: number
  cachedFiles: number
}
```

## Usage Example

```js
import requireCSS from 'rollup-plugin-require-css'

const cssPlugin = requireCSS({
  modules: true,
  minify: true
})

export default {
  input: 'src/index.js',
  output: { file: 'dist/index.js', format: 'es' },
  plugins: [cssPlugin]
}

// In a build script
async function build() {
  const bundle = await rollup(config)
  await bundle.write(outputConfig)

  // Access plugin data after build
  console.log('Styles:', cssPlugin.api.getStyles())
  console.log('CSS Modules:', cssPlugin.api.getCSSModules())
  console.log('Stats:', cssPlugin.api.getStats())
}
```
