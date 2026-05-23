import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AppProvider } from './context/AppContext'
import './index.css'

// 挂载导航配置到全局，避免 App.jsx 重复 import
import { NAV_GROUPS } from './config/navigation'
if (typeof window !== 'undefined') window.__NAV_GROUPS__ = { NAV_GROUPS }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
)
