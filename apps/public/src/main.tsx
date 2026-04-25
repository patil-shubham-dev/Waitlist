import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AdminApp from './AdminApp'
import './index.css'

const Root = () => {
  if (window.location.pathname.startsWith('/admin7276')) {
    return <AdminApp />
  }
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
