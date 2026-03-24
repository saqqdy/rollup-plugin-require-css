# 插件 API

插件返回一个带有额外 `api` 属性的 Rollup 插件实例。

## 属性

### name

- **类型**: `string`
- **值**: `'require-css'`

插件名称。

```js
const plugin = requireCSS()
console.log(plugin.name) // 'require-css'
```

### version

- **类型**: `string`
- **值**: 当前插件版本

插件版本。

```js
const plugin = requireCSS()
console.log(plugin.version) // '1.0.0'
```

### api

- **类型**: `PluginApi`

用于外部访问的插件 API。

## API 方法

### getStyles()

获取所有收集的样式映射。

- **返回值**: `Map<string, string>`

```js
const plugin = requireCSS()
// 构建后...
const styles = plugin.api.getStyles()
styles.forEach((css, id) => {
  console.log(`${id}: ${css.length} 字节`)
})
```

### getCSSModules()

获取 CSS Modules 类名映射。

- **返回值**: `Map<string, Record<string, string>>`

```js
const plugin = requireCSS({ modules: true })
// 构建后...
const modules = plugin.api.getCSSModules()
modules.forEach((classes, id) => {
  console.log(`${id}:`, classes)
  // { button: '_button_x5f2a', primary: '_primary_abc12' }
})
```

### getClassName()

从 CSS module 获取特定类名。

- **参数**:
  - `id` - 模块 ID（文件路径）
  - `className` - 原始类名
- **返回值**: `string | undefined`

```js
const plugin = requireCSS({ modules: true })
// 构建后...
const className = plugin.api.getClassName('/src/button.module.css', 'primary')
console.log(className) // '_primary_abc12'
```

### getStats()

获取构建统计信息。

- **返回值**: `Stats`

```js
const plugin = requireCSS()
// 构建后...
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

清除插件缓存。

- **返回值**: `void`

```js
const plugin = requireCSS({ cache: true })
plugin.api.clearCache()
```

## TypeScript 类型

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

## 使用示例

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

// 在构建脚本中
async function build() {
  const bundle = await rollup(config)
  await bundle.write(outputConfig)

  // 构建后访问插件数据
  console.log('样式:', cssPlugin.api.getStyles())
  console.log('CSS Modules:', cssPlugin.api.getCSSModules())
  console.log('统计:', cssPlugin.api.getStats())
}
```
