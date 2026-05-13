import { useState, useCallback } from 'react'
import { useAppState } from '../context/useAppState'
import type { ViewingKey } from '../types'
import { cn } from '../lib/utils'

interface AuditDashboardProps {
  className?: string
}

// Mock viewing key generator that doesn't depend on @cloak.dev/sdk
// This avoids browser-side errors from Node-only dependencies like blake-hash
async function mockGenerateViewingKey(scope: string, _expiry: number): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.floor(Math.random() * 500)))
  const timestamp = Date.now()
  const randomPart = Array.from({ length: 16 }, () =>
    '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[
      Math.floor(Math.random() * 58)
    ]
  ).join('')
  return `cloak_vk_${scope}_${timestamp}_${randomPart}`
}

function AuditDashboard({ className }: AuditDashboardProps) {
  const { state, dispatch } = useAppState()
  const [generating, setGenerating] = useState(false)

  const viewingKeys = state.audit.viewingKeys

  const handleGenerateKey = useCallback(async () => {
    setGenerating(true)
    try {
      const keyString = await mockGenerateViewingKey('audit', 30)

      const parts = keyString.split('_')
      const scope = parts[2] || 'audit'
      const timestamp = parseInt(parts[3], 10)
      const createdAt = new Date(timestamp)
      const expiry = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000)

      const viewingKey: ViewingKey = {
        id: keyString,
        key: keyString,
        scope,
        expiry,
        createdAt,
        status: 'active',
      }

      dispatch({ type: 'ADD_VIEWING_KEY', payload: viewingKey })
    } catch (err) {
      console.error('Failed to generate viewing key:', err)
    } finally {
      setGenerating(false)
    }
  }, [dispatch])

  const handleCopyKey = useCallback(async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
    } catch (err) {
      console.error('Failed to copy key:', err)
    }
  }, [])

  const handleRevokeKey = useCallback((id: string) => {
    dispatch({ type: 'REVOKE_VIEWING_KEY', payload: id })
  }, [dispatch])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString()
  }

  const getDaysUntilExpiry = (expiry: Date) => {
    const diff = expiry.getTime() - Date.now()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? `${days}d` : 'Expired'
  }

  return (
    <div data-testid="audit-dashboard" className={cn(className)}>
      <h3 className="text-neutral-100 font-semibold mb-4">Audit</h3>
      <input
        type="text"
        placeholder="Enter viewing key"
        className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-2 text-neutral-100 placeholder-neutral-500 mb-4"
      />
      <button
        onClick={handleGenerateKey}
        disabled={generating}
        className="w-full bg-primary-500 hover:bg-primary-600 text-neutral-0 font-semibold py-2 px-4 rounded-lg mb-4 disabled:opacity-50"
      >
        {generating ? 'Generating...' : 'Generate Key'}
      </button>
      <div className="bg-neutral-800 rounded-lg p-4">
        {viewingKeys.length === 0 ? (
          <p className="text-neutral-400 text-center">Viewing keys will appear here</p>
        ) : (
          <div className="space-y-3">
            {viewingKeys.map((key, index) => (
              <div
                key={key.id}
                data-testid={`key-row-${index}`}
                className={cn(
                  'bg-neutral-800 rounded-lg p-3 border border-neutral-600',
                  key.status === 'revoked' && 'opacity-50 grayscale'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <code className="text-xs text-primary-300 font-mono break-all">{key.key}</code>
                  <button
                    data-testid={`copy-key-${index}`}
                    onClick={() => handleCopyKey(key.key)}
                    className="ml-2 text-xs bg-neutral-600 hover:bg-neutral-500 text-neutral-0 px-2 py-1 rounded"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-primary-900 text-primary-200 px-2 py-0.5 rounded">
                    Scope: {key.scope}
                  </span>
                  <span className="bg-success-500/10 text-success-500 px-2 py-0.5 rounded">
                    Created: {formatDate(key.createdAt)}
                  </span>
                  <span className="bg-secondary-500/10 text-secondary-400 px-2 py-0.5 rounded">
                    Expires: {getDaysUntilExpiry(key.expiry)}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded',
                      key.status === 'active'
                        ? 'bg-success-500/10 text-success-500'
                        : 'bg-error-500/10 text-error-500'
                    )}
                  >
                    {key.status === 'active' ? 'Active' : 'Revoked'}
                  </span>
                </div>
                {key.status === 'active' && (
                  <button
                    data-testid={`revoke-key-${index}`}
                    onClick={() => handleRevokeKey(key.id)}
                    className="mt-2 text-xs bg-error-500 hover:bg-error-600 text-neutral-0 px-2 py-1 rounded"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditDashboard
