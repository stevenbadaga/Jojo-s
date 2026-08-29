import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './header-tweaks.css'
import './admin-premium.css'
import './products-polish.css'
import './auth-premium.css'
import './auth-refine.css'
import './home-cinematic-clean.css'
import { installBrandCleanup } from './utils/brandCleanup.js'
import { installContactEmailSync } from './utils/contactEmailSync.js'
import { installCinematicEnhancements } from './utils/cinematicEnhancements.js'

installBrandCleanup()
installContactEmailSync()
installCinematicEnhancements()

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('MarketMet service worker registration failed:', error)
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
