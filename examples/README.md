# Examples

This directory contains example projects demonstrating how to use `rollup-plugin-require-css`.

## Examples

- [rollup-v2](./rollup-v2) - Usage with Rollup 2.x (CommonJS)
- [rollup-v4](./rollup-v4) - Usage with Rollup 4.x (ESM with import assertions)

## Running Examples

```bash
# Rollup v2 example
cd rollup-v2
pnpm install
pnpm build

# Rollup v4 example
cd rollup-v4
pnpm install
pnpm build
```

## Output

Each example will generate:
- `dist/index.js` - JavaScript bundle
- `dist/style.css` - Bundled CSS file
