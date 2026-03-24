# Examples

This section contains example projects demonstrating how to use `rollup-plugin-require-css`.

## Online Examples

Try the plugin online with StackBlitz or CodeSandbox:

| Example | Description | Link |
|---------|-------------|------|
| Basic | Basic CSS import and bundling | [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/basic) |
| CSS Modules | Scoped CSS with CSS Modules | [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/css-modules) |
| Preprocessors | Sass, Less, and Stylus | [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/preprocessors) |
| PostCSS | PostCSS with autoprefixer | [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/postcss) |
| Code Splitting | Split CSS by entry | [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/code-splitting) |
| Shadow DOM | Constructable stylesheets | [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/shadow-dom) |

## Local Examples

Clone the repository and try the examples locally:

```bash
git clone https://github.com/saqqdy/rollup-plugin-require-css.git
cd rollup-plugin-require-css/examples/basic
pnpm install
pnpm run build
cat dist/style.css
```

## Feature Coverage

| Feature | basic | css-modules | preprocessors | postcss | code-splitting | shadow-dom |
|---------|-------|-------------|---------------|---------|----------------|------------|
| CSS import | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| CSS Modules | - | ✓ | ✓ | - | - | - |
| Sass/SCSS | - | - | ✓ | - | - | - |
| Less | - | - | ✓ | - | - | - |
| Stylus | - | - | ✓ | - | - | - |
| PostCSS | - | - | - | ✓ | - | - |
| Code splitting | - | - | - | - | ✓ | - |
| Shadow DOM | - | - | - | - | - | ✓ |
| Source maps | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Minification | ✓ | ✓ | - | - | - | - |
