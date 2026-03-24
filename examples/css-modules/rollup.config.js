import requireCss from 'rollup-plugin-require-css'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    requireCss({
      output: 'styles.css',
      minify: true,
      // CSS Modules auto-detect .module.css files
      modules: {
        enabled: 'auto',
        // Custom scoped name generator
        generateScopedName: (name, filename) => {
          const hash = filename.split('/').pop()?.split('.')[0] || ''
          return `_${name}_${hash}`
        }
      }
    })
  ]
}
