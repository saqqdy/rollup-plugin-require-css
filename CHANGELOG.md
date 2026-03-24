# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-03-24

### Added

#### Core Features

- CSS import and bundling support
- CSSStyleSheet mode for Shadow DOM
- Custom transform function support
- Include/exclude file patterns

#### CSS Modules

- Auto-detect `.module.css` files
- Force enable with `modules: true`
- Custom scoped name generator
- Export class name mappings

#### Preprocessor Support

- Sass/SCSS compilation
- Less compilation
- Stylus compilation
- Automatic detection based on file extension

#### PostCSS Integration

- Use any PostCSS plugins
- Configurable options
- Source map support

#### Source Maps

- Inline source maps
- External `.css.map` files
- Accurate line mappings

#### HMR (Hot Module Replacement)

- Development mode support
- Custom HMR events

#### CSS Code Splitting

- Split CSS by entry points
- Dynamic output file names
- Per-entry CSS bundles

#### Advanced Minification

- Remove comments
- Collapse whitespace
- Remove redundant values
- Merge rules
- Optimize selectors

#### Caching System

- File-based cache
- Configurable TTL
- Cache invalidation

#### Plugin API

- `getStyles()` - Get all collected styles
- `getCSSModules()` - Get CSS Modules mappings
- `getClassName()` - Get specific class name
- `getStats()` - Get processing statistics
- `clearCache()` - Clear the cache

### Changed

- Improved source map generation with v3 format
- Better TypeScript type definitions
- Updated project structure

### Fixed

- Transform function result now properly used
- Source map format compliance
