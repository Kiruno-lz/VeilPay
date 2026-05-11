import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Shield,
  Wallet,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { ClaimDetails } from '../components/ClaimDetails'
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

  const [isClaiming, setIsClaiming] = useState(false)
  const [claimStatus, setClaimStatus] = useState<'idle' | 'claiming' | 'success' | 'error'>('idle')
  const [txSignature, setTxSignature] = useState<string | null>(null)
  // HACKATHON: Will be used in C6 for actual claim transaction
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const handleClaim = useCallback(async () => {
    if (!connected || !publicKey) return

    setIsClaiming(true)
    setClaimStatus('claiming')

    // Placeholder claim logic — will be replaced by real CloakSDK.receive() in Phase C
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock successful claim
      const mockTxSignature =
        '5xT7pQmN3vW8rK2jH9sL4dF6gH1kM0nB3cV5xZ7qW9eR2tY4uI6oP8aS0dF2gH4jK6lM8nB0vC2xZ4qW6eR8tY0uI2oP4aS6dF8gH0jK'

      setTxSignature(mockTxSignature)
      setClaimStatus('success')
    } catch {
      setClaimStatus('error')
    } finally {
      setIsClaiming(false)
    }
  }, [connected, publicKey])

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
        {claimStatus !== 'success' && (
          <div className="mb-6">
            <button
              onClick={handleClaim}
              disabled={!connected || isClaiming}
              className={`w-full py-4 px-6 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                !connected || isClaiming
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              }`}
              data-testid="claim-button"
            >
              {isClaiming ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Claim USDC
                </>
              )}
            </button>

            {/* Status text */}
            <div className="mt-3 text-center">
              {claimStatus === 'claiming' && (
                <p className="text-sm text-indigo-400" data-testid="claim-status">
                  Processing your claim...
                </p>
              )}
              {claimStatus === 'error' && (
                <p className="text-sm text-red-400" data-testid="claim-status">
                  Claim failed. Please try again.
                </p>
              )}
              {!connected && (
                <p className="text-sm text-gray-500" data-testid="claim-status">
                  Connect your wallet to claim
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success State */}
        {claimStatus === 'success' && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-green-500/20">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
            </div>
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white mb-1">Received!</h2>
              <p className="text-gray-400 text-sm">Check your wallet.</p>
            </div>

            {txSignature && (
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Transaction</span>
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    data-testid="tx-signature-link"
                  >
                    View on Explorer
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="font-mono text-xs text-gray-300 break-all">
                  {truncateToken(txSignature, 16, 16)}
                </p>
              </div>
            )}
          </div>
        )}

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
