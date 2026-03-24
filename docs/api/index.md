# API Reference

This section provides detailed documentation for all plugin options and APIs.

## Quick Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `output` | `string \| function` | Auto | CSS output file name |
| `inject` | `boolean` | `false` | Inject CSS into bundle |
| `minify` | `boolean \| object` | `false` | Enable CSS minification |
| `modules` | `boolean \| object` | `{ enabled: 'auto' }` | CSS Modules config |
| `postcss` | `object` | - | PostCSS configuration |
| `preprocessor` | `object` | - | Preprocessor options |
| `sourcemap` | `boolean \| string` | `false` | Source map mode |
| `split` | `boolean` | `false` | Enable code splitting |
| `hmr` | `boolean` | `false` | Enable HMR support |
| `cache` | `boolean \| object` | `false` | Caching options |
| `transform` | `function` | - | Custom CSS transform |
| `onExtract` | `function` | - | Extract callback |

## Sections

- [Options](/api/options) - Detailed options documentation
- [Plugin API](/api/plugin-api) - Exposed plugin properties and methods
