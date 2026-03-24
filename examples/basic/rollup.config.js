const requireCss = require('rollup-plugin-require-css')

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    requireCss({
      output: 'style.css',
      minify: true
    })
  ]
}
