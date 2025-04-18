import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './css/main.css'
import App from './App.jsx'
import Navbar from './components/Navbar.jsx'
import { SettingsProvider } from './contexts/SettingsContext.jsx'
import axios from 'axios'

// Set default configuration for all axios requests
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <BrowserRouter>
        <Navbar />
        <App />
      </BrowserRouter>
    </SettingsProvider>
  </StrictMode>,
);