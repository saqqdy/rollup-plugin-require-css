---
layout: home

hero:
  name: rollup-plugin-require-css
  text: Import CSS in Rollup
  tagline: A powerful rollup plugin for importing CSS with CSS Modules, preprocessors, and more
  image:
    src: /logo.svg
    alt: rollup-plugin-require-css
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/saqqdy/rollup-plugin-require-css

features:
  - icon: 🎨
    title: CSS Modules
    details: Auto-detect or force enable CSS Modules with scoped class names
  - icon: 📦
    title: Preprocessor Support
    details: Sass/SCSS, Less, Stylus out of the box
  - icon: ⚡
    title: PostCSS Integration
    details: Use any PostCSS plugins like autoprefixer
  - icon: 🗺️
    title: Source Maps
    details: Generate accurate source maps for debugging
  - icon: 🔥
    title: HMR Support
    details: Hot Module Replacement for development
  - icon: ✂️
    title: Code Splitting
    details: Split CSS by entry points
---

## Quick Start

### Install

```bash
# pnpm
pnpm add -D rollup-plugin-require-css

# npm
npm install -D rollup-plugin-require-css
```

### Usage

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

## Why rollup-plugin-require-css?

- **CSS Modules**: Auto-detect `.module.css` files or force enable for all CSS
- **Preprocessors**: Built-in support for Sass, Less, and Stylus
- **PostCSS**: Full PostCSS integration with plugin support
- **Source Maps**: Generate source maps for easier debugging
- **Code Splitting**: Automatic CSS splitting for multiple entry points
- **Minification**: Advanced CSS minification options
- **Plugin API**: Access styles, CSS modules, and stats programmatically
