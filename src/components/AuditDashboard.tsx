interface AuditDashboardProps {
  className?: string
}

function AuditDashboard({ className }: AuditDashboardProps) {
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
          <button className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg mb-4">
            Generate Key
          </button>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-center">Viewing keys will appear here</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuditDashboard
