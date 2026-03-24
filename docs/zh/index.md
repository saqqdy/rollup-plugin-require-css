---
layout: home

hero:
  name: rollup-plugin-require-css
  text: Rollup CSS 导入插件
  tagline: 强大的 Rollup CSS 导入插件，支持 CSS Modules、预处理器等
  image:
    src: /logo.svg
    alt: rollup-plugin-require-css
  actions:
    - theme: brand
      text: 快速上手
      link: /zh/guide/getting-started
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/saqqdy/rollup-plugin-require-css

features:
  - icon: 🎨
    title: CSS Modules
    details: 自动检测或强制启用 CSS Modules，支持作用域类名
  - icon: 📦
    title: 预处理器支持
    details: 开箱即用支持 Sass/SCSS、Less、Stylus
  - icon: ⚡
    title: PostCSS 集成
    details: 支持任何 PostCSS 插件，如 autoprefixer
  - icon: 🗺️
    title: Source Maps
    details: 生成精确的 source maps 便于调试
  - icon: 🔥
    title: HMR 支持
    details: 开发环境下的热模块替换
  - icon: ✂️
    title: 代码分割
    details: 按入口点分割 CSS
---

## 快速开始

### 安装

```bash
# pnpm
pnpm add -D rollup-plugin-require-css

# npm
npm install -D rollup-plugin-require-css
```

### 使用

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

## 为什么选择 rollup-plugin-require-css？

- **CSS Modules**：自动检测 `.module.css` 文件或对所有 CSS 强制启用
- **预处理器**：内置支持 Sass、Less 和 Stylus
- **PostCSS**：完整的 PostCSS 集成，支持各种插件
- **Source Maps**：生成 source maps 方便调试
- **代码分割**：多入口点自动分割 CSS
- **压缩**：高级 CSS 压缩选项
- **插件 API**：程序化访问样式、CSS modules 和统计信息
