import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './header-tweaks.css'
import './admin-premium.css'
import { installBrandCleanup } from './utils/brandCleanup.js'

installBrandCleanup()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
