import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import App from './App.tsx'
import { AppStateProvider } from './context/AppState'

// Default to devnet
const endpoint = 'https://api.devnet.solana.com'

export function Root() {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppStateProvider>
            <App />
          </AppStateProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
