import './shared.css'
import './app.css'

console.log('App bundle loaded')

// Create app UI
const header = document.createElement('div')
header.className = 'app-header'
header.textContent = 'App Header'

const content = document.createElement('div')
content.className = 'app-content'
content.innerHTML = `
  <div class="app-card">Card 1</div>
  <div class="app-card">Card 2</div>
  <div class="app-card">Card 3</div>
`

document.body.appendChild(header)
document.body.appendChild(content)
