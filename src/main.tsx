import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Polyfill for window.storage requirement
if (typeof window !== 'undefined' && !window.storage) {
  // @ts-ignore - Extending window object
  window.storage = window.localStorage;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
