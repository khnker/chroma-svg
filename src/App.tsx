import { useState, useMemo, useEffect, useCallback } from 'react'
import { SvgUploader } from './components/SvgUploader'
import { SvgPreview } from './components/SvgPreview'
import { SvgTabBar } from './components/SvgTabBar'
import { ColorList } from './components/ColorList'
import { ColorPickerPanel } from './components/ColorPickerPanel'
import { PaletteBrowser } from './components/PaletteBrowser'
import { QuickPalettePanel } from './components/QuickPalettePanel'
import { PaletteGallery } from './components/PaletteGallery'
import { TrendingPalettes } from './components/TrendingPalettes'
import { usePaletteGallery } from './hooks/usePaletteGallery'
import { useMultiSvg } from './hooks/useMultiSvg'
import { useSvgLoader } from './hooks/useSvgLoader'
import { useColorExtractor } from './hooks/useColorExtractor'
import { useColorMap } from './hooks/useColorMap'
import { usePreview } from './hooks/usePreview'
import { useUrlState } from './hooks/useUrlState'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { Dialog } from './components/ui/Dialog'
import { isNearBlackOrWhite, getAdjacentContrastPairs } from './lib/color-utils'
import { homogenizeColorMap } from './lib/homogenize'
import { HomogenizeSlider } from './components/HomogenizeSlider'
import { ThemePreview } from './components/ThemePreview'
import type { ColorEntry, PaletteColor } from './core/types'

type Tab = 'palettes' | 'trending' | 'harmonies' | 'gallery'
type ViewTab = 'svg' | 'theme'

export default function App() {
  const { initialState, pushState, clearUrl } = useUrlState()
  const [hydrated, setHydrated] = useState(!initialState)
  const initialSvgs = useMemo(
    () => (initialState?.svgs ?? []).map((s) => ({ id: crypto.randomUUID(), raw: s.raw, fileName: s.fileName })),
    [],
  )
  const { svgs, activeSvg, hasSvgs, addSvg, removeSvg, setActive } = useMultiSvg(initialSvgs)
  const { loadFile, error: loaderError } = useSvgLoader({
    onLoad: (raw, name) => addSvg(raw, name),
  })
  const { colors, contrastMap } = useColorExtractor(activeSvg?.raw ?? null, activeSvg?.id)
  const { colorMap, updateColor, resetColor, resetAll, applyPalette, applySmartPalette, undo, redo } = useColorMap(initialState?.colorMap ?? {})
  const [homogenizeFactor, setHomogenizeFactor] = useState(0)
  const previewColorMap = useMemo(
    () => homogenizeFactor > 0.01 ? homogenizeColorMap(colorMap, homogenizeFactor) : colorMap,
    [colorMap, homogenizeFactor],
  )
  const { previewSvg } = usePreview(activeSvg?.raw ?? null, previewColorMap)
  const adjacentContrastPairs = useMemo(
    () => getAdjacentContrastPairs(contrastMap.edges, colorMap, 3),
    [contrastMap, colorMap],
  )
  const galleries = usePaletteGallery(activeSvg?.raw ?? null, colors, contrastMap)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<ColorEntry | null>(null)
  const [tab, setTab] = useState<Tab>('trending')
  const [viewTab, setViewTab] = useState<ViewTab>('svg')
  const [pickerPos, setPickerPos] = useState<{ x: number; y: number } | null>(null)
  const [lastAppliedPalette, setLastAppliedPalette] = useState<string[] | null>(null)
  const [paletteRotation, setPaletteRotation] = useState(0)

  useEffect(() => {
    if (!hydrated) { setHydrated(true); return }
    pushState(svgs, colorMap)
  }, [svgs, colorMap, pushState, hydrated])

  useEffect(() => {
    setLastAppliedPalette(null)
    setPaletteRotation(0)
  }, [activeSvg?.id])

  const handleColorSelect = (entry: ColorEntry) => {
    setSelectedEntry(entry)
    setSelectedColor(entry.normalized)
  }

  const closePicker = useCallback(() => {
    setSelectedEntry(null)
    setPickerPos(null)
  }, [])

  const handlePaletteSelect = (color: PaletteColor) => {
    if (selectedEntry) {
      updateColor(selectedEntry.original, color.hex)
    }
  }

  const handleSvgColorClick = useCallback((fill: string, e: React.MouseEvent<HTMLDivElement>) => {
    const lower = fill.toLowerCase()
    const revMap: Record<string, string> = {}
    for (const [orig, repl] of Object.entries(colorMap)) {
      revMap[repl.toLowerCase()] = orig
    }
    const orig = revMap[lower] ?? lower
    const entry = colors.find(
      (c) => c.original.toLowerCase() === orig || c.normalized.toLowerCase() === orig
    )
    if (entry) {
      handleColorSelect(entry)
      const rect = e.currentTarget.getBoundingClientRect()
      setPickerPos({ x: e.clientX - rect.left, y: 0 })
    }
  }, [colors, colorMap])

  const handleApplyPalette = useCallback((paletteColors: string[]) => {
    const filtered = paletteColors.filter((c) => !isNearBlackOrWhite(c))
    if (filtered.length === 0) return
    const assignOffset = paletteRotation % filtered.length
    const entries = colors.map((c, i) => ({
      original: c.original,
      replacement: filtered[(i + assignOffset) % filtered.length],
    }))
    setLastAppliedPalette(filtered)
    setPaletteRotation(prev => prev + 1)
    setHomogenizeFactor(0)
    applyPalette(entries)
  }, [colors, applyPalette, paletteRotation])

  const handleReset = () => {
    setSelectedColor(null)
    setSelectedEntry(null)
    setLastAppliedPalette(null)
    setHomogenizeFactor(0)
    resetAll()
  }

  const handleNewSession = () => {
    clearUrl()
    setTimeout(() => window.location.reload(), 50)
  }

  const handleExport = useCallback(() => {
    if (!previewSvg || !activeSvg) return
    const blob = new Blob([previewSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = activeSvg.fileName.replace(/\.svg$/i, '') + '-recolored.svg'
    a.click()
    URL.revokeObjectURL(url)
  }, [previewSvg, activeSvg])

  const [helpOpen, setHelpOpen] = useState(false)
  const handleExportCss = useCallback(() => {
    if (!activeSvg) return
    downloadCssTokens(colorMap, activeSvg.fileName.replace(/\.svg$/i, ''))
  }, [colorMap, activeSvg])

  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onReset: handleReset,
    onExport: handleExport,
    onExportCss: handleExportCss,
    onHelp: () => setHelpOpen(true),
  })

  const themeColors = (() => {
    const sorted = [...colors].sort((a, b) => b.elementCount - a.elementCount)
    return sorted.slice(0, 3).map((c) => colorMap[c.original] ?? c.normalized)
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <SvgTabBar
            svgs={svgs}
            activeId={activeSvg?.id ?? null}
            onSelect={setActive}
            onClose={removeSvg}
          />
          <button
            onClick={handleNewSession}
            className="ml-3 px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600"
          >
            New Session
          </button>
          <button
            onClick={handleExportCss}
            className="ml-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
          >
            CSS
          </button>
          <button
            onClick={() => setHelpOpen(true)}
            className="ml-1 px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200"
          >
            ?
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {!hasSvgs && <SvgUploader onFile={loadFile} hasFile={false} />}

        {loaderError && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {loaderError}
          </div>
        )}

        {hasSvgs && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

              {/* LEFT: Preview (SVG | Theme) + Tools */}
              <div className="space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto">
                <div className="relative">
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setViewTab('svg')}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${viewTab === 'svg' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      SVG
                    </button>
                    <button
                      onClick={() => setViewTab('theme')}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${viewTab === 'theme' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Theme
                    </button>
                  </div>
                  {viewTab === 'svg' ? (
                    <SvgPreview
                      svgContent={previewSvg}
                      fileName={activeSvg?.fileName ?? null}
                      onReset={handleReset}
                      onColorClick={handleSvgColorClick}
                    />
                  ) : (
                    <ThemePreview colorMap={colorMap} svgName={activeSvg?.fileName.replace(/\.svg$/i, '') ?? 'colors'} />
                  )}
                  {viewTab === 'svg' && selectedEntry && pickerPos && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={closePicker} />
                      <div
                        className="fixed z-20"
                        style={{ left: pickerPos.x, top: pickerPos.y + 8 }}
                      >
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-lg w-64">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Edit</span>
                            <button onClick={closePicker} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                          </div>
                          <ColorPickerPanel
                            original={selectedEntry.original}
                            current={colorMap[selectedEntry.original] ?? selectedEntry.normalized}
                            onChange={(c) => updateColor(selectedEntry.original, c)}
                            onReset={() => resetColor(selectedEntry.original)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {colors.length > 0 && (
                  <div className="space-y-3">
                    <HomogenizeSlider
                      value={homogenizeFactor}
                      onChange={setHomogenizeFactor}
                    />
                    <ColorList
                      colors={colors}
                      colorMap={colorMap}
                      onColorSelect={(entry) => { handleColorSelect(entry); setPickerPos(null) }}
                      selectedColor={selectedColor}
                    />
                  </div>
                )}
              </div>

              {/* RIGHT: Palettes + Edit */}
              <div className="space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Palettes</h4>
                  <div className="flex gap-2 mb-4">
                    {(['trending', 'harmonies', 'palettes', 'gallery'] as Tab[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors
                          ${tab === t ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {t === 'trending' ? 'Trending' : t === 'harmonies' ? 'Harmonies' : t === 'palettes' ? 'Palettes' : 'Gallery'}
                      </button>
                    ))}
                  </div>

                  {tab === 'trending' && <TrendingPalettes onApply={handleApplyPalette} />}

                  {tab === 'palettes' && (
                    <div className="space-y-6">
                      <PaletteBrowser onColorSelect={handlePaletteSelect} onApply={handleApplyPalette} />
                      <TrendingPalettes onApply={handleApplyPalette} />
                    </div>
                  )}

                  {tab === 'harmonies' && themeColors.length > 0 && (
                    <QuickPalettePanel
                      seedColor={themeColors[0]}
                      paletteColors={lastAppliedPalette ?? undefined}
                      onApply={handleApplyPalette}
                    />
                  )}

                  {tab === 'gallery' && (
                    <PaletteGallery
                      galleries={galleries}
                      onApplyPalette={handleApplyPalette}
                    />
                  )}
                </div>

                {selectedEntry && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Edit {selectedEntry.normalized}
                    </h3>
                    <ColorPickerPanel
                      original={selectedEntry.original}
                      current={colorMap[selectedEntry.original] ?? selectedEntry.normalized}
                      onChange={(c) => updateColor(selectedEntry.original, c)}
                      onReset={() => resetColor(selectedEntry.original)}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Dialog isOpen={helpOpen} onClose={() => setHelpOpen(false)} title="Keyboard Shortcuts">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-600"><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Z</kbd> Undo</span></div>
          <div className="flex justify-between"><span className="text-gray-600"><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Shift+Z</kbd> Redo</span></div>
          <div className="flex justify-between"><span className="text-gray-600"><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">R</kbd> Reset colors</span></div>
          <div className="flex justify-between"><span className="text-gray-600"><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">E</kbd> Export SVG</span></div>
          <div className="flex justify-between"><span className="text-gray-600"><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">?</kbd> Show this help</span></div>
        </div>
      </Dialog>
    </div>
  )
}
