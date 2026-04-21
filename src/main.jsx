import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Apply saved theme before first paint to avoid flash
const savedTheme = localStorage.getItem('theme') ?? 'dark'
document.documentElement.setAttribute('data-theme', savedTheme)
import './styles/variables.css'
import './styles/global.css'
import { DataProvider } from './context/DataContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </StrictMode>,
)
