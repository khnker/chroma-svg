import { useState } from 'react'
import { usePalettes } from '@/hooks/usePalettes'
import type { PaletteColor } from '@/core/types'

interface PaletteBrowserProps {
  onColorSelect: (color: PaletteColor) => void
  onApply: (colors: string[]) => void
}

export function PaletteBrowser({ onColorSelect, onApply }: PaletteBrowserProps) {
  const { palettes, searchQuery, setSearchQuery } = usePalettes()
  const [coolorsUrl, setCoolorsUrl] = useState('')
  const [imported, setImported] = useState<string[] | null>(null)
  const [error, setError] = useState('')

  const handleImport = () => {
    setError('')
    const last = coolorsUrl.trim().split('/').filter(Boolean).pop()
    if (!last) { setError('Pega una URL de coolors.co'); return }
    const parts = last.split('-')
    const hexes = parts.filter((p) => /^[0-9a-fA-F]{6}$/.test(p)).map((h) => '#' + h)
    if (hexes.length < 2) { setError('No se encontraron colores válidos'); return }
    setImported(hexes)
  }

  return (
    <div className="space-y-4">
      <details className="text-sm">
        <summary className="cursor-pointer text-neutral-500 hover:text-neutral-700 font-medium">
          Import from Coolors
        </summary>
        <div className="mt-2 flex gap-2">
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
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {imported && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex gap-0.5 flex-1">
              {imported.map((c) => (
                <div
                  key={c}
                  className="flex-1 h-6 rounded"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <button
              onClick={() => onApply(imported)}
              className="px-3 py-1 text-xs bg-neutral-800 text-white rounded-lg hover:bg-neutral-900"
            >
              Apply
            </button>
          </div>
        )}
      </details>

      <input
        type="text"
        placeholder="Search palettes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
      />
      {palettes.map((palette) => (
        <div key={palette.name}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-neutral-700">{palette.name}</h4>
            <button
              onClick={() => onApply(palette.colors.map((c) => c.hex))}
              className="px-2.5 py-1 text-xs bg-neutral-800 text-white rounded-lg hover:bg-neutral-900"
            >
              Apply
            </button>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {palette.colors.map((color) => (
              <button
                key={color.hex}
                onClick={() => onColorSelect(color)}
                className="w-full aspect-square rounded border border-neutral-200 hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: color.hex }}
                title={`${color.name} — ${color.hex}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
