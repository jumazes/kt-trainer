import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { PlayerNameProvider } from './hooks/usePlayerName'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PlayerNameProvider>
        <App />
      </PlayerNameProvider>
    </BrowserRouter>
  </StrictMode>,
)
