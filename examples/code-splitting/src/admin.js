import './shared.css'
import './admin.css'

console.log('Admin bundle loaded')

// Create admin UI
const header = document.createElement('div')
header.className = 'admin-header'
header.textContent = 'Admin Panel'

const table = document.createElement('table')
table.className = 'admin-table'
table.innerHTML = `
  <thead>
    <tr><th>ID</th><th>Name</th><th>Status</th></tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>Item 1</td><td>Active</td></tr>
    <tr><td>2</td><td>Item 2</td><td>Inactive</td></tr>
  </tbody>
`

document.body.appendChild(header)
document.body.appendChild(table)
