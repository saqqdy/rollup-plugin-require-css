const requireCss = require('rollup-plugin-require-css')

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'es'
  },
  plugins: [
    requireCss({
      output: 'style.css',
      minify: true
    })
  ]
}
