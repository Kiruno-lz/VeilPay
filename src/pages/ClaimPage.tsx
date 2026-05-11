import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Shield,
  Wallet,
  AlertCircle,
} from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { ClaimDetails } from '../components/ClaimDetails'
import { ClaimButton } from '../components/ClaimButton'
import type { ClaimPayload } from '../lib/claimLink'

function truncateToken(token: string, start = 8, end = 8): string {
  if (token.length <= start + end + 3) return token
  return `${token.slice(0, start)}...${token.slice(-end)}`
}

function truncateAddress(address: string | null, start = 4, end = 4): string {
  if (!address) return ''
  if (address.length <= start + end + 3) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

function ClaimPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const { connected, publicKey, connect } = useWallet()

  const [claimPayload, setClaimPayload] = useState<ClaimPayload | null>(null)

  const handleValidClaim = useCallback((payload: ClaimPayload) => {
    setClaimPayload(payload)
  }, [])

  const handleConnectWallet = useCallback(async () => {
    try {
      await connect()
    } catch {
      // Wallet connection errors are handled by the adapter UI
    }
  }, [connect])

  // ── Error state: no token ───────────────────────────────────────────────
  if (!token) {
    return (
      <div
        data-testid="claim-page"
        className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4"
      >
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-3">Invalid Claim Link</h1>
          <p className="text-gray-400 mb-8" data-testid="claim-error">
            Invalid or missing claim link
          </p>
          <div className="bg-gray-800 rounded-lg p-4 border border-red-500/20">
            <p className="text-sm text-red-400">
              The claim token is missing from the URL. Make sure you received a valid claim link.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Main claim page ─────────────────────────────────────────────────────
  return (
    <div data-testid="claim-page" className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Shield className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Claim Your Tokens</h1>
          <p className="text-gray-400 text-sm">
            Securely receive your USDC via VeilPay
          </p>
        </div>

        {/* Token Info Card */}
        <div className="bg-gray-800 rounded-lg p-5 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Claim Token</span>
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
              JWT
            </span>
          </div>
          <div className="font-mono text-sm text-indigo-300 break-all" data-testid="claim-token">
            {truncateToken(token)}
          </div>
        </div>

        {/* Amount Display */}
        <div className="mb-6">
          <ClaimDetails token={token} onValid={handleValidClaim} />
        </div>

        {/* Wallet Connection */}
        <div className="bg-gray-800 rounded-lg p-5 mb-6 border border-gray-700" data-testid="claim-wallet-section">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium">Wallet</span>
            </div>
            {connected && (
              <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                Connected
              </span>
            )}
          </div>

          {!connected ? (
            <button
              onClick={handleConnectWallet}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              data-testid="connect-wallet-button"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-gray-300">Connected</span>
              </div>
              <span className="font-mono text-sm text-white" data-testid="connected-wallet">
                {truncateAddress(publicKey)}
              </span>
            </div>
          )}
        </div>

        {/* Claim Button */}
        <ClaimButton
          commitment={claimPayload?.commitment ?? ''}
          note={claimPayload?.note ?? ''}
        />

        {/* Footer info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Powered by VeilPay · Secure & Anonymous
          </p>
        </div>
      </div>
    </div>
  )
}

export default ClaimPage
