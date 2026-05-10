interface UploadCSVProps {
  className?: string
}

function UploadCSV({ className }: UploadCSVProps) {
  return (
    <div
      data-testid="upload-csv"
      className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className || ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          1
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-4">Upload CSV</h3>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <p className="text-gray-400">Drag & drop CSV file here</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadCSV
