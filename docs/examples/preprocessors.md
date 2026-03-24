# Preprocessors Example

This example demonstrates using Sass, Less, and Stylus preprocessors.

## Features Tested

- Sass/SCSS compilation
- Less compilation
- Stylus compilation
- Import paths

## Setup

Install the preprocessors you need:

```bash
# For Sass/SCSS
pnpm add -D sass

# For Less
pnpm add -D less

# For Stylus
pnpm add -D stylus
```

## Configuration

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
      output: 'dist/style.css',
      preprocessor: {
        sass: {
          includePaths: ['src/styles']
        },
        less: {
          paths: ['src/styles']
        },
        stylus: {
          paths: ['src/styles']
        }
      }
    })
  ]
}
```

## Source Code

::: details src/index.js
```js
import './styles/main.scss'
import './styles/theme.less'
import './styles/base.styl'
```
:::

::: details src/styles/_variables.scss
```scss
// Sass variables
$primary-color: #3b82f6;
$secondary-color: #6366f1;
$border-radius: 4px;
```
:::

::: details src/styles/main.scss
```scss
@use 'variables' as *;

.button {
  padding: 8px 16px;
  border: none;
  border-radius: $border-radius;
  background-color: $primary-color;
  color: white;

  &:hover {
    background-color: darken($primary-color, 10%);
  }
}
```
:::

::: details src/styles/theme.less
```less
@primary: #3b82f6;
@secondary: #6366f1;

.card {
  border: 1px solid lighten(@primary, 30%);
  border-radius: 8px;
  padding: 16px;

  &-header {
    font-size: 1.2em;
    color: @primary;
  }
}
```
:::

::: details src/styles/base.styl
```stylus
primary = #3b82f6

.container
  max-width 1200px
  margin 0 auto

  &--fluid
    max-width 100%
    padding 0 16px
```
:::

## Try It

```bash
cd examples/preprocessors
pnpm install
pnpm run build
cat dist/style.css
```

## Output

**dist/style.css**
```css
.button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #3b82f6;
  color: white;
}
.button:hover {
  background-color: #2563eb;
}

.card {
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 16px;
}
.card-header {
  font-size: 1.2em;
  color: #3b82f6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}
.container--fluid {
  max-width: 100%;
  padding: 0 16px;
}
```

## Try Online

- [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/preprocessors)
- [CodeSandbox](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/preprocessors)
