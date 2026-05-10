import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@solana/wallet-adapter-react-ui/styles.css'
import './index.css'
import { Root } from './Root.tsx'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')
createRoot(root).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)