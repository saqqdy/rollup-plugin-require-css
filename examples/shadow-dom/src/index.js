import './styles.css'
import componentStyles from './component.css' assert { type: 'css' }

// Use CSSStyleSheet for Shadow DOM
class MyComponent extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.adoptedStyleSheets = [componentStyles]
    shadow.innerHTML = '<div class="component">Hello World</div>'
  }
}

customElements.define('my-component', MyComponent)
