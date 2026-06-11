import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// HashFame dark mode: lock document to dark permanently
document.documentElement.setAttribute('data-theme', 'dark');
document.documentElement.style.background = '#0a0a0a';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
