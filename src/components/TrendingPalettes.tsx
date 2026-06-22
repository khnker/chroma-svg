import { useState } from 'react'
import { useTrendingPalettes } from '@/hooks/useTrendingPalettes'
import type { PaletteColor } from '@/core/types'

interface TrendingPalettesProps {
  onApply: (colors: string[], paletteName?: string) => void
  selectedPalette?: string[] | null
  handlePaletteSelect?: (color: PaletteColor) => void
}

export function TrendingPalettes({ onApply, selectedPalette, handlePaletteSelect }: TrendingPalettesProps) {
  const { palettes, loading, error, refetch } = useTrendingPalettes()
  const [coolorsUrl, setCoolorsUrl] = useState('')
  const [imported, setImported] = useState<string[] | null>(null)
  const [importError, setImportError] = useState('')

  const handleImport = () => {
    setImportError('')
    const last = coolorsUrl.trim().split('/').filter(Boolean).pop()
    if (!last) { setImportError('Paste a coolors.co URL'); return }
    const parts = last.split('-')
    const hexes = parts.filter((p) => /^[0-9a-fA-F]{6}$/.test(p)).map((h) => '#' + h)
    if (hexes.length < 2) { setImportError('No valid colors found in URL'); return }
    setImported(hexes)
  }

  const isSelected = (hexes: string[]) =>
    selectedPalette !== null && selectedPalette !== undefined &&
    selectedPalette.length === hexes.length &&
    selectedPalette.every((c, i) => c.toLowerCase() === hexes[i].toLowerCase())

  return (
    <div className="space-y-3">

      {/* Coolors Import */}
      <div className="pb-3 border-b border-neutral-100">
        <p className="text-xs font-medium text-neutral-600 mb-2">Import from Coolors</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://coolors.co/0267c1-0075c4-efa00b"
            value={coolorsUrl}
            onChange={(e) => { setCoolorsUrl(e.target.value); setImported(null) }}
            className="flex-1 px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <button
            onClick={handleImport}
            className="px-3 py-2 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Import
          </button>
        </div>
        {importError && <p className="text-xs text-red-500 mt-1">{importError}</p>}
        {imported && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex gap-0.5 flex-1">
              {imported.map((c) => (
                <div key={c} className="flex-1 h-6 rounded" style={{ backgroundColor: c }} title={c} />
              ))}
            </div>
            <button onClick={() => onApply(imported)} className="px-3 py-1 text-xs bg-neutral-800 text-white rounded-lg hover:bg-neutral-900">
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Trending header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-neutral-700">Trending on Coolors</h4>
        <button
          onClick={refetch}
          disabled={loading}
          className="px-3 py-1 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Trending palettes grid */}
      {palettes.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {palettes.map((p) => {
            const sel = isSelected(p.hexes)
            return (
              <div
                key={p.id}
                onClick={() => onApply(p.hexes, p.name)}
                className={`relative rounded-xl border bg-white shadow-sm overflow-hidden transition-all flex flex-col cursor-pointer
                  ${sel
                    ? 'ring-2 ring-primary-500 border-primary-300 shadow-md'
                    : 'border-neutral-200 hover:border-neutral-300 hover:shadow-md'}`}
              >
                <div className="flex h-10">
                  {p.hexes.map((c, i) => (
                    <div key={i} className="flex-1 first:rounded-tl-lg last:rounded-tr-lg" style={{ backgroundColor: c }} title={c} />
                  ))}
                </div>
                {sel && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-neutral-700 truncate">{p.name}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{p.hexes.join(' · ')}</p>
                </div>
                {sel && (
                  <p className="text-[9px] text-primary-600 font-medium px-2 pb-1.5">
                    Click to re-apply &middot; colors rotate
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
      {!loading && palettes.length === 0 && !error && (
        <p className="text-xs text-neutral-400">Run <code className="bg-neutral-100 px-1 rounded">node scripts/scrape-trending.cjs</code> to fetch trending palettes</p>
      )}
    </div>
  )
}
