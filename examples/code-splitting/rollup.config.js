import requireCss from 'rollup-plugin-require-css'

export default {
  // Multiple entry points
  input: ['src/app.js', 'src/admin.js'],
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    requireCss({
      // Enable CSS code splitting
      split: true,
      // Dynamic output file names
      output: (chunk) => `${chunk.name}.css`,
      minify: true
    })
  ]
}
