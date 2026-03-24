# Getting Started

## Installation

Install the plugin as a development dependency:

```bash
# pnpm
pnpm add -D rollup-plugin-require-css

# npm
npm install -D rollup-plugin-require-css

# yarn
yarn add -D rollup-plugin-require-css
```

## Basic Setup

Add the plugin to your Rollup configuration:

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

::: tip Plugin Order
Place the plugin before other plugins that process the output to ensure CSS is collected properly.
:::

## How It Works

The plugin hooks into Rollup's build process to collect and bundle CSS:

1. **Transform phase**: Intercepts CSS imports and collects styles
2. **GenerateBundle phase**: Outputs the combined CSS to a file

## Requirements

- Rollup >= 2.0.0
- Node.js >= 14

## Next Steps

- [Basic Usage](/guide/basic-usage) - Learn the basic usage patterns
- [Advanced Usage](/guide/advanced-usage) - Explore advanced features
- [API Reference](/api/) - Full API documentation
