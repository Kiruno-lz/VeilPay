import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Buffer } from 'buffer'
import '@solana/wallet-adapter-react-ui/styles.css'
import './index.css'
import { Root } from './Root.tsx'

// Polyfill Buffer for browser environments (required by @solana/spl-token-metadata)
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer
}

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')
createRoot(root).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Root />
    </BrowserRouter>
  </StrictMode>,
)
