import { useState } from 'react'

interface CoolorsImportProps {
  onApply: (colors: string[]) => void
}

export function CoolorsImport({ onApply }: CoolorsImportProps) {
  const [coolorsUrl, setCoolorsUrl] = useState('')
  const [imported, setImported] = useState<string[] | null>(null)
  const [error, setError] = useState('')

  const handleImport = () => {
    setError('')
    const last = coolorsUrl.trim().split('/').filter(Boolean).pop()
    if (!last) { setError('Paste a coolors.co URL'); return }
    const parts = last.split('-')
    const hexes = parts.filter((p) => /^[0-9a-fA-F]{6}$/.test(p)).map((h) => '#' + h)
    if (hexes.length < 2) { setError('No valid colors found'); return }
    setImported(hexes)
  }

  return (
    <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50">
      <p className="text-xs font-medium text-neutral-600 mb-2">Import from Coolors</p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="https://coolors.co/0267c1-0075c4-efa00b"
          value={coolorsUrl}
          onChange={(e) => { setCoolorsUrl(e.target.value); setImported(null) }}
          className="flex-1 px-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
        />
        <button
          onClick={handleImport}
          className="px-3 py-1.5 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
        >
          Import
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {imported && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex gap-0.5 flex-1">
            {imported.map((c) => (
              <div
                key={c}
                className="flex-1 h-5 rounded"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
          <button
            onClick={() => onApply(imported)}
            className="px-2.5 py-1 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-900 rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}
