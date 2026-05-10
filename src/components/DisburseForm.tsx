interface DisburseFormProps {
  className?: string
}

function DisburseForm({ className }: DisburseFormProps) {
  return (
    <div
      data-testid="disburse-form"
      className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className || ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          3
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-4">Disburse</h3>
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <p className="text-gray-400 text-center">No recipients yet</p>
          </div>
          <button
            disabled
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Disburse
          </button>
        </div>
      </div>
    </div>
  )
}

export default DisburseForm
