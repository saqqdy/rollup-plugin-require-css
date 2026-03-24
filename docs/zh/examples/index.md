# 示例

本节包含演示如何使用 `rollup-plugin-require-css` 的示例项目。

## 在线示例

通过 StackBlitz 或 CodeSandbox 在线试用：

| 示例 | 说明 | 链接 |
|------|------|------|
| 基础 | 基础 CSS 导入和打包 | [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/basic) |
| CSS Modules | CSS Modules 作用域类名 | [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/css-modules) |
| 预处理器 | Sass、Less 和 Stylus | [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/preprocessors) |
| PostCSS | PostCSS 与 autoprefixer | [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/postcss) |
| 代码分割 | 按入口分割 CSS | [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/code-splitting) |
| Shadow DOM | 可构造样式表 | [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/shadow-dom) |

## 本地示例

克隆仓库并在本地试用示例：

```bash
git clone https://github.com/saqqdy/rollup-plugin-require-css.git
cd rollup-plugin-require-css/examples/basic
pnpm install
pnpm run build
cat dist/style.css
```

## 功能覆盖

| 功能 | basic | css-modules | preprocessors | postcss | code-splitting | shadow-dom |
|------|-------|-------------|---------------|---------|----------------|------------|
| CSS 导入 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| CSS Modules | - | ✓ | ✓ | - | - | - |
| Sass/SCSS | - | - | ✓ | - | - | - |
| Less | - | - | ✓ | - | - | - |
| Stylus | - | - | ✓ | - | - | - |
| PostCSS | - | - | - | ✓ | - | - |
| 代码分割 | - | - | - | - | ✓ | - |
| Shadow DOM | - | - | - | - | - | ✓ |
| Source maps | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| 压缩 | ✓ | ✓ | - | - | - | - |
