# 快速上手

## 安装

将插件作为开发依赖安装：

```bash
# pnpm
pnpm add -D rollup-plugin-require-css

# npm
npm install -D rollup-plugin-require-css

# yarn
yarn add -D rollup-plugin-require-css
```

## 基础配置

将插件添加到你的 Rollup 配置中：

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
      output: 'style.css',
      minify: true
    })
  ]
}
```

::: tip 插件顺序
将插件放在处理输出的其他插件之前，以确保 CSS 被正确收集。
:::

## 工作原理

插件在 Rollup 的构建过程中收集和打包 CSS：

1. **转换阶段**：拦截 CSS 导入并收集样式
2. **生成打包阶段**：将合并的 CSS 输出到文件

## 系统要求

- Rollup >= 2.0.0
- Node.js >= 14

## 下一步

- [基础用法](/zh/guide/basic-usage) - 学习基础使用模式
- [进阶用法](/zh/guide/advanced-usage) - 探索高级功能
- [API 参考](/zh/api/) - 完整 API 文档
