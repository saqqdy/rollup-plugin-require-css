# PostCSS Example

This example demonstrates PostCSS integration with autoprefixer.

## Features Tested

- PostCSS plugins
- Autoprefixer
- Custom PostCSS configuration

## Setup

Install PostCSS and plugins:

```bash
pnpm add -D postcss autoprefixer
```

## Configuration

```js
import requireCSS from 'rollup-plugin-require-css'
import autoprefixer from 'autoprefixer'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'es'
  },
  plugins: [
    requireCSS({
      output: 'dist/style.css',
      postcss: {
        enabled: true,
        plugins: [
          autoprefixer({
            overrideBrowserslist: ['> 1%', 'last 2 versions']
          })
        ]
      }
    })
  ]
}
```

## Source Code

::: details src/index.js
```js
import './styles.css'
```
:::

::: details src/styles.css
```css
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}

.button {
  appearance: none;
  backdrop-filter: blur(10px);
  transition: transform 0.2s ease;
}

.button:active {
  transform: scale(0.95);
}
```
:::

## Try It

```bash
cd examples/postcss
pnpm install
pnpm run build
cat dist/style.css
```

## Output

**dist/style.css**
```css
.container {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.button {
  -webkit-appearance: none;
  appearance: none;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  -webkit-transition: -webkit-transform 0.2s ease;
  transition: -webkit-transform 0.2s ease;
  transition: transform 0.2s ease;
  transition: transform 0.2s ease, -webkit-transform 0.2s ease;
}

.button:active {
  -webkit-transform: scale(0.95);
  transform: scale(0.95);
}
```

## Using PostCSS Config File

You can also use a `postcss.config.js` file:

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer')()
  ]
}
```

Then in your Rollup config:

```js
requireCSS({
  output: 'dist/style.css',
  postcss: { enabled: true }
})
```

## Try Online

- [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/postcss)
- [CodeSandbox](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/postcss)
