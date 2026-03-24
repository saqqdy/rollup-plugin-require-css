import buttonStyles from './button.module.css'
import cardStyles from './card.module.css'

console.log('Button styles:', buttonStyles)
console.log('Card styles:', cardStyles)

// Use class names in your components
const button = document.createElement('button')
button.className = buttonStyles.button
button.textContent = 'Click me'

const card = document.createElement('div')
card.className = cardStyles.card
card.innerHTML = `<h2 class="${cardStyles.title}">Card Title</h2><p class="${cardStyles.content}">Card content</p>`

document.body.appendChild(button)
document.body.appendChild(card)
