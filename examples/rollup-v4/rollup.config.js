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
      output: 'style.css',
      minify: true
    })
  ]
}
