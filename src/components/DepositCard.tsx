interface DepositCardProps {
  className?: string
}

function DepositCard({ className }: DepositCardProps) {
  return (
    <div
      data-testid="deposit-card"
      className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className || ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          2
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-4">Deposit</h3>
          <p className="text-gray-400 mb-4">Enter amount to deposit</p>
          <input
            type="number"
            placeholder="0.00"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 mb-4"
          />
          <button
            disabled
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Deposit
          </button>
        </div>
      </div>
    </div>
  )
}

export default DepositCard
