import { useState, useMemo } from 'react'
import { generateTailwindTokens } from '../core/color-replacer'
import type { ColorMap } from '../core/types'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  svgContent: string | null
  colorMap: ColorMap
  svgName: string
}

type ExportTab = 'svg' | 'css' | 'json'

export function ExportDialog({ isOpen, onClose, svgContent, colorMap, svgName }: ExportDialogProps) {
  const [tab, setTab] = useState<ExportTab>('svg')
  const [copied, setCopied] = useState(false)

  const cssTokens = useMemo(() => generateTailwindTokens(colorMap), [colorMap])
  const paletteJson = useMemo(() => JSON.stringify(colorMap, null, 2), [colorMap])

  if (!isOpen) return null

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = (content: string, mime: string, ext: string) => {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${svgName}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabs: { id: ExportTab; label: string }[] = [
    { id: 'svg', label: 'SVG' },
    { id: 'css', label: 'CSS Tokens' },
    { id: 'json', label: 'Palette JSON' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-[0_20px_60px_0_rgba(0,0,0,0.12)] max-w-xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h2 className="text-base font-semibold text-neutral-800">Export</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-sm text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100">
            ✕
          </button>
        </div>

        {/* tabs */}
        <div className="flex gap-1 px-5 pt-4 pb-2 border-b border-neutral-100">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${tab === t.id
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* content */}
        <div className="flex-1 overflow-auto p-5">
          {tab === 'svg' && (
            <div className="space-y-4">
              {svgContent ? (
                <>
                  <div className="bg-neutral-50 rounded-lg p-4 flex items-center justify-center max-h-48 overflow-auto border border-neutral-200">
                    <div className="w-32 h-32 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: svgContent }} />
                  </div>
                  <pre className="bg-neutral-900 text-neutral-100 text-xs p-3 rounded-lg overflow-x-auto max-h-40 font-mono">
                    {svgContent.slice(0, 2000)}{svgContent.length > 2000 ? '\n... (truncated)' : ''}
                  </pre>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(svgContent, 'image/svg+xml', 'svg')}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                    >
                      Download SVG
                    </button>
                    <button
                      onClick={() => handleCopy(svgContent)}
                      className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-neutral-400 text-center py-8">No SVG content to export</p>
              )}
            </div>
          )}

          {tab === 'css' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">Tailwind CSS v4 theme tokens generated from your color map.</p>
              <pre className="bg-neutral-900 text-neutral-100 text-xs p-3 rounded-lg overflow-x-auto max-h-60 font-mono">{cssTokens}</pre>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(cssTokens, 'text/css', 'css')}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                >
                  Download CSS
                </button>
                <button
                  onClick={() => handleCopy(cssTokens)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {tab === 'json' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">Color map as JSON — original → replacement pairs.</p>
              <pre className="bg-neutral-900 text-neutral-100 text-xs p-3 rounded-lg overflow-x-auto max-h-60 font-mono">{paletteJson}</pre>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(paletteJson, 'application/json', 'json')}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                >
                  Download JSON
                </button>
                <button
                  onClick={() => handleCopy(paletteJson)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
