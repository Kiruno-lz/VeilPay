import { useState, useCallback } from 'react'
import { useAppState } from '../context/useAppState'
import type { ViewingKey } from '../types'

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
    <div
      data-testid="audit-dashboard"
      className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className || ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          4
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-4">Audit</h3>
          <input
            type="text"
            placeholder="Enter viewing key"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 mb-4"
          />
          <button
            onClick={handleGenerateKey}
            disabled={generating}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg mb-4 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Key'}
          </button>
          <div className="bg-gray-700 rounded-lg p-4">
            {viewingKeys.length === 0 ? (
              <p className="text-gray-400 text-center">Viewing keys will appear here</p>
            ) : (
              <div className="space-y-3">
                {viewingKeys.map((key, index) => (
                  <div
                    key={key.id}
                    data-testid={`key-row-${index}`}
                    className={`bg-gray-800 rounded-lg p-3 border border-gray-600 ${
                      key.status === 'revoked' ? 'opacity-50 grayscale' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-xs text-blue-300 break-all">{key.key}</code>
                      <button
                        data-testid={`copy-key-${index}`}
                        onClick={() => handleCopyKey(key.key)}
                        className="ml-2 text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded">
                        Scope: {key.scope}
                      </span>
                      <span className="bg-green-900 text-green-200 px-2 py-0.5 rounded">
                        Created: {formatDate(key.createdAt)}
                      </span>
                      <span className="bg-yellow-900 text-yellow-200 px-2 py-0.5 rounded">
                        Expires: {getDaysUntilExpiry(key.expiry)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded ${
                          key.status === 'active'
                            ? 'bg-green-900 text-green-200'
                            : 'bg-red-900 text-red-200'
                        }`}
                      >
                        {key.status === 'active' ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                    {key.status === 'active' && (
                      <button
                        data-testid={`revoke-key-${index}`}
                        onClick={() => handleRevokeKey(key.id)}
                        className="mt-2 text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded"
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
      </div>
    </div>
  )
}

export default AuditDashboard
