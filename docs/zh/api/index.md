# API 参考

本节提供所有插件选项和 API 的详细文档。

## 快速参考

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `output` | `string \| function` | 自动 | CSS 输出文件名 |
| `inject` | `boolean` | `false` | 将 CSS 注入打包文件 |
| `minify` | `boolean \| object` | `false` | 启用 CSS 压缩 |
| `modules` | `boolean \| object` | `{ enabled: 'auto' }` | CSS Modules 配置 |
| `postcss` | `object` | - | PostCSS 配置 |
| `preprocessor` | `object` | - | 预处理器选项 |
| `sourcemap` | `boolean \| string` | `false` | Source map 模式 |
| `split` | `boolean` | `false` | 启用代码分割 |
| `hmr` | `boolean` | `false` | 启用 HMR 支持 |
| `cache` | `boolean \| object` | `false` | 缓存选项 |
| `transform` | `function` | - | 自定义 CSS 转换 |
| `onExtract` | `function` | - | 提取回调 |

## 章节

- [选项](/zh/api/options) - 详细的选项文档
- [插件 API](/zh/api/plugin-api) - 暴露的插件属性和方法
