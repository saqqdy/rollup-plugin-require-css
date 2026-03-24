# PostCSS 示例

本示例演示 PostCSS 与 autoprefixer 的集成。

## 测试功能

- PostCSS 插件
- Autoprefixer
- 自定义 PostCSS 配置

## 安装

安装 PostCSS 和插件：

```bash
pnpm add -D postcss autoprefixer
```

## 配置

```js
import requireCSS from 'rollup-plugin-require-css'
import autoprefixer from 'autoprefixer'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'es'
  },
  plugins: [
    requireCSS({
      output: 'dist/style.css',
      postcss: {
        enabled: true,
        plugins: [
          autoprefixer({
            overrideBrowserslist: ['> 1%', 'last 2 versions']
          })
        ]
      }
    })
  ]
}
```

## 源代码

::: details src/index.js
```js
import './styles.css'
```
:::

::: details src/styles.css
```css
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}

.button {
  appearance: none;
  backdrop-filter: blur(10px);
  transition: transform 0.2s ease;
}

.button:active {
  transform: scale(0.95);
}
```
:::

## 试一试

```bash
cd examples/postcss
pnpm install
pnpm run build
cat dist/style.css
```

## 输出

**dist/style.css**
```css
.container {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.button {
  -webkit-appearance: none;
  appearance: none;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  -webkit-transition: -webkit-transform 0.2s ease;
  transition: -webkit-transform 0.2s ease;
  transition: transform 0.2s ease;
  transition: transform 0.2s ease, -webkit-transform 0.2s ease;
}

.button:active {
  -webkit-transform: scale(0.95);
  transform: scale(0.95);
}
```

## 使用 PostCSS 配置文件

你也可以使用 `postcss.config.js` 文件：

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer')()
  ]
}
```

然后在 Rollup 配置中：

```js
requireCSS({
  output: 'dist/style.css',
  postcss: { enabled: true }
})
```

## 在线试用

- [StackBlitz](https://stackblitz.com/github/saqqdy/rollup-plugin-require-css/tree/master/examples/postcss)
- [CodeSandbox](https://codesandbox.io/s/github/saqqdy/rollup-plugin-require-css/tree/master/examples/postcss)
