import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './header-tweaks.css'
import './admin-premium.css'
import './products-polish.css'
import './home-produce-polish.css'
import { installBrandCleanup } from './utils/brandCleanup.js'
import { installContactEmailSync } from './utils/contactEmailSync.js'
import { installHeroProduceUpgrade } from './utils/heroProduceUpgrade.js'

installBrandCleanup()
installContactEmailSync()
installHeroProduceUpgrade()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
