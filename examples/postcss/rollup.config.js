import requireCss from 'rollup-plugin-require-css'
import autoprefixer from 'autoprefixer'

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
      postcss: {
        enabled: true,
        plugins: [
          autoprefixer({
            // Target browsers
            overrideBrowserslist: ['> 1%', 'last 2 versions']
          })
        ]
      }
    })
  ]
}
