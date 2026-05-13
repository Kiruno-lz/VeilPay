import { useState, useCallback, useRef } from 'react'
import { Upload, FileText, AlertCircle, X } from 'lucide-react'
import { parsePayrollCSV } from '../lib/csvParser'
import { useAppState } from '../context/useAppState'
import { cn } from '../lib/utils'
import type { RowResult } from '../lib/csvParser'

interface UploadCSVProps {
  className?: string
}

function formatUsdc(amount: number): string {
  return (amount / 1_000_000).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function UploadCSV({ className }: UploadCSVProps) {
  const { dispatch } = useAppState()
  const [isDragging, setIsDragging] = useState(false)
  const [parsedRows, setParsedRows] = useState<RowResult[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processCSV = useCallback(
    (csvContent: string, name: string) => {
      const result = parsePayrollCSV(csvContent)

      if (result.errors.length > 0 && result.recipients.length === 0) {
        setError(result.errors[0])
        setParsedRows([])
        setTotal(0)
        setFileName(name)
        dispatch({ type: 'SET_RECIPIENTS', payload: [] })
        return
      }

      setParsedRows(result.rows)
      setTotal(result.total)
      setError(null)
      setFileName(name)
      dispatch({ type: 'SET_RECIPIENTS', payload: result.recipients })
    },
    [dispatch]
  )

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a valid CSV file')
        setParsedRows([])
        setTotal(0)
        setFileName(file.name)
        dispatch({ type: 'SET_RECIPIENTS', payload: [] })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (!content || !content.trim()) {
          setError('Please upload a valid CSV file')
          setParsedRows([])
          setTotal(0)
          setFileName(file.name)
          dispatch({ type: 'SET_RECIPIENTS', payload: [] })
          return
        }
        processCSV(content, file.name)
      }
      reader.onerror = () => {
        setError('Please upload a valid CSV file')
        setParsedRows([])
        setTotal(0)
        setFileName(file.name)
        dispatch({ type: 'SET_RECIPIENTS', payload: [] })
      }
      reader.readAsText(file)
    },
    [dispatch, processCSV]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleClear = useCallback(() => {
    setParsedRows([])
    setTotal(0)
    setError(null)
    setFileName(null)
    dispatch({ type: 'SET_RECIPIENTS', payload: [] })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [dispatch])

  return (
    <div
      data-testid="upload-csv"
      className={cn(className)}
    >
      <h3 className="text-white font-semibold mb-4">Upload CSV</h3>

      {fileName ? (
        <div className="mb-4">
          <div className="flex items-center gap-2 bg-neutral-700 rounded-lg px-4 py-3">
            <FileText className="w-5 h-5 text-primary-400" />
            <span className="text-neutral-200 text-sm flex-1 truncate">{fileName}</span>
            <button
              data-testid="clear-file"
              onClick={handleClear}
              className="p-1 hover:bg-neutral-600 rounded transition-colors"
            >
              <X className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
        </div>
      ) : (
        <div
          data-testid="drop-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-neutral-600 hover:border-primary-400 bg-primary-500/10'
          )}
        >
          <Upload className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">
            Drag & drop CSV file here, or <span className="text-primary-400">click to browse</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
            data-testid="file-input"
          />
        </div>
      )}

      {error && (
        <div
          data-testid="csv-error"
          className="mt-4 flex items-center gap-2 text-error-500 text-sm bg-error-500/10 border border-error-500/20 rounded-lg px-4 py-3"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {parsedRows.length > 0 && (
        <div className="mt-4">
          <div className="overflow-x-auto rounded-lg border border-neutral-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-900/50 text-neutral-400">
                  <th className="text-left px-4 py-2 font-medium">Address</th>
                  <th className="text-right px-4 py-2 font-medium">Amount (USDC)</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((row, index) => (
                  <tr
                    key={index}
                    data-testid={`csv-row-${index}`}
                    className={cn(
                      row.error
                        ? 'bg-error-500/10 hover:bg-error-500/20 cursor-help'
                        : 'bg-neutral-800 hover:bg-neutral-700/50'
                    )}
                    title={row.error}
                  >
                    <td className="px-4 py-2 text-neutral-200 font-mono text-xs truncate max-w-[200px]">
                      {row.address}
                    </td>
                    <td className="px-4 py-2 text-right text-neutral-200">
                      {formatUsdc(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-700 border-t border-neutral-700">
                  <td className="px-4 py-2 text-neutral-200 font-semibold">Total</td>
                  <td
                    data-testid="csv-total"
                    className="px-4 py-2 text-right text-neutral-200 font-semibold"
                  >
                    {formatUsdc(total)} USDC
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadCSV
