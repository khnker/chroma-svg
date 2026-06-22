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
import { Tooltip } from './components/ui/Tooltip'
import { Logo } from './components/Logo'
import { isNearBlackOrWhite } from './lib/color-utils'
import { homogenizeColorMap } from './lib/homogenize'
import { downloadCssTokens } from './core/color-replacer'
import { HomogenizeSlider } from './components/HomogenizeSlider'
import { ThemePreview } from './components/ThemePreview'
import type { ColorEntry, PaletteColor } from './core/types'

type Tab = 'palettes' | 'trending' | 'harmonies' | 'gallery'
type ViewTab = 'svg' | 'theme'

const TAB_LABELS: Record<Tab, string> = {
  palettes: 'Palettes',
  trending: 'Trending',
  harmonies: 'Harmonies',
  gallery: 'Gallery',
}

export default function App() {
  const { initialState, pushState } = useUrlState()
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
    <div className="min-h-screen bg-neutral-50 font-sans antialiased text-neutral-900">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Logo size={28} />
            <div className="leading-tight">
              <h1 className="text-sm font-semibold text-neutral-900">Chroma SVG</h1>
              <p className="text-[10px] text-neutral-400">Color replacement tool</p>
            </div>
          </div>

          {hasSvgs && (
            <>
              {svgs.length > 1 && (
                <div className="flex-1 min-w-0">
                  <SvgTabBar
                    svgs={svgs}
                    activeId={activeSvg?.id ?? null}
                    onSelect={setActive}
                    onClose={removeSvg}
                  />
                </div>
              )}
              <div className="flex items-center gap-1 shrink-0">
                <Tooltip content="Export CSS tokens">
                  <button
                    onClick={handleExportCss}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    Export CSS
                  </button>
                </Tooltip>
                <Tooltip content="Reset all colors">
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                </Tooltip>
                <Tooltip content="Keyboard shortcuts">
                  <button
                    onClick={() => setHelpOpen(true)}
                    className="w-8 h-8 flex items-center justify-center text-xs font-bold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    ?
                  </button>
                </Tooltip>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Empty state */}
        {!hasSvgs && <SvgUploader onFile={loadFile} hasFile={false} />}

        {/* Error */}
        {loaderError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {loaderError}
          </div>
        )}

        {/* Workspace */}
        {hasSvgs && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── LEFT: Preview area (3/5) ── */}
            <div className="lg:col-span-3 space-y-5 min-w-0">

              {/* Preview tabs */}
              <div className="flex items-center gap-3">
                <div className="flex rounded-lg border border-neutral-200 bg-white p-0.5 shadow-sm">
                  {(['svg', 'theme'] as ViewTab[]).map((vt) => (
                    <button
                      key={vt}
                      onClick={() => setViewTab(vt)}
                      className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all
                        ${viewTab === vt
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                      {vt === 'svg' ? 'SVG Preview' : 'Theme Preview'}
                    </button>
                  ))}
                </div>
                {/* After tabs: export button */}
                {viewTab === 'svg' && (
                  <Tooltip content="Download recolored SVG">
                    <button
                      onClick={handleExport}
                      className="px-4 py-1.5 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors shadow-sm"
                    >
                      Export SVG
                    </button>
                  </Tooltip>
                )}
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

              {/* Color tools */}
              {colors.length > 0 && (
                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-neutral-800">Color palette</h2>
                      <p className="text-[11px] text-neutral-400">{colors.length} colors detected — click a color to edit</p>
                    </div>
                  </div>
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

            {/* ── RIGHT: Palettes sidebar (2/5) ── */}
            <div className="lg:col-span-2 space-y-4 min-w-0">

              {/* Tab bar */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 pt-3">
                <div className="flex gap-1 mb-3">
                  {(['trending', 'harmonies', 'palettes', 'gallery'] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all text-center
                        ${tab === t
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'}`}
                    >
                      {TAB_LABELS[t]}
                    </button>
                  ))}
                </div>

                {tab === 'trending' && (
                  <section>
                    <p className="text-[11px] text-neutral-400 mb-3">Popular color palettes from the community</p>
                    <TrendingPalettes onApply={handleApplyPalette} />
                  </section>
                )}

                {tab === 'harmonies' && (
                  <section>
                    <p className="text-[11px] text-neutral-400 mb-3">Color harmonies based on your active palette</p>
                    {themeColors.length > 0 ? (
                      <QuickPalettePanel
                        seedColor={themeColors[0]}
                        paletteColors={lastAppliedPalette ?? undefined}
                        onApply={handleApplyPalette}
                      />
                    ) : (
                      <p className="text-xs text-neutral-400 py-4 text-center">Load an SVG to see harmonies</p>
                    )}
                  </section>
                )}

                {tab === 'palettes' && (
                  <section>
                    <p className="text-[11px] text-neutral-400 mb-3">Browse curated palettes or import from Coolors</p>
                    <PaletteBrowser onColorSelect={handlePaletteSelect} onApply={handleApplyPalette} />
                  </section>
                )}

                {tab === 'gallery' && (
                  <section>
                    <p className="text-[11px] text-neutral-400 mb-3">Preview your SVG with different color combinations</p>
                    <PaletteGallery
                      galleries={galleries}
                      onApplyPalette={handleApplyPalette}
                    />
                  </section>
                )}
              </div>

              {/* Inline color picker */}
              {selectedEntry && (
                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-neutral-800">
                      Edit <span className="font-mono text-primary-600">{selectedEntry.normalized}</span>
                    </h3>
                    <button onClick={closePicker} className="text-xs text-neutral-400 hover:text-neutral-600">
                      Close
                    </button>
                  </div>
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
        )}
      </main>

      {/* ── Help Dialog ── */}
      <Dialog isOpen={helpOpen} onClose={() => setHelpOpen(false)} title="Keyboard shortcuts">
        <div className="space-y-3 text-sm">
          {[
            { keys: 'Ctrl+Z', label: 'Undo last color change' },
            { keys: 'Ctrl+Shift+Z', label: 'Redo last undo' },
            { keys: 'R', label: 'Reset all colors to original' },
            { keys: 'E', label: 'Download recolored SVG' },
            { keys: '?', label: 'Show this help dialog' },
          ].map(({ keys, label }) => (
            <div key={keys} className="flex items-center justify-between py-1">
              <span className="text-neutral-600">{label}</span>
              <kbd className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-xs font-mono text-neutral-500">
                {keys}
              </kbd>
            </div>
          ))}
        </div>
      </Dialog>

    </div>
  )
}


