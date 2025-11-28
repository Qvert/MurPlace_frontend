import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Initialize AOS and feather icons if loaded via index.html
if (typeof window !== 'undefined'){
  try {
    if (window.AOS && typeof window.AOS.init === 'function') window.AOS.init()
    if (window.feather && typeof window.feather.replace === 'function') window.feather.replace()
  } catch (e) {
    // ignore
  }
}
