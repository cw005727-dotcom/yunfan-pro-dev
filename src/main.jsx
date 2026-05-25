import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AppProvider } from './context/AppContext'
import './index.css'

import { NAV_GROUPS } from './config/navigation'
if (typeof window !== 'undefined') window.__NAV_GROUPS__ = { NAV_GROUPS }

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppProvider>
    <App />
  </AppProvider>,
)
