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
      preprocessor: {
        // Sass/SCSS configuration
        sass: {
          includePaths: ['src']
        },
        // Less configuration
        less: {
          paths: ['src']
        },
        // Stylus configuration
        stylus: {
          paths: ['src']
        }
      }
    })
  ]
}
