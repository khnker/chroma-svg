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
import { ExportDialog } from './components/ExportDialog'
import { usePaletteGallery } from './hooks/usePaletteGallery'
import { useMultiSvg } from './hooks/useMultiSvg'
import { useSvgLoader } from './hooks/useSvgLoader'
import { useColorExtractor } from './hooks/useColorExtractor'
import { useColorMap } from './hooks/useColorMap'
import { usePreview } from './hooks/usePreview'
import { useUrlState } from './hooks/useUrlState'
import { useStorage } from './hooks/useStorage'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { Dialog } from './components/ui/Dialog'
import { Tooltip } from './components/ui/Tooltip'
import { Logo } from './components/Logo'
import { isNearBlackOrWhite } from './lib/color-utils'
import { homogenizeColorMap } from './lib/homogenize'
import { HomogenizeSlider } from './components/HomogenizeSlider'
import { ThemePreview } from './components/ThemePreview'
import type { ColorEntry, PaletteColor } from './core/types'

type Tab = 'trending' | 'palettes' | 'harmonies' | 'gallery'
type ViewTab = 'svg' | 'theme'

const TAB_LABELS: Record<Tab, string> = {
  trending: 'Trending',
  palettes: 'Palettes',
  harmonies: 'Harmonies',
  gallery: 'Gallery',
}

const TAB_ICONS: Record<Tab, string> = {
  trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  palettes: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
  harmonies: 'M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.06 16.368l.75-1.3M7.5 4.5L12 3l4.5 1.5',
  gallery: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
}

export default function App() {
  // ── Storage & URL ──
  const { initialSvgs, initialColorMap, initialActiveIndex, persist, clearSession } = useStorage()
  const { initialState: urlState, pushState: pushUrl, clearUrl } = useUrlState()
  const [hydrated, setHydrated] = useState(false)

  const mergedSvgs = useMemo(() => {
    const fromStorage = initialSvgs.map((s) => ({ id: crypto.randomUUID(), raw: s.raw, fileName: s.fileName }))
    if (fromStorage.length > 0) return fromStorage
    if (urlState) return [{ id: crypto.randomUUID(), raw: urlState.raw, fileName: urlState.fileName }]
    return []
  }, [])

  // ── Multi-SVG ──
  const { svgs, activeSvg, hasSvgs, addSvg, removeSvg, setActive } = useMultiSvg(mergedSvgs)
  const { loadFile, error: loaderError } = useSvgLoader({
    onLoad: (raw, name) => addSvg(raw, name),
  })

  // ── Color extraction & map ──
  const { colors, contrastMap } = useColorExtractor(activeSvg?.raw ?? null, activeSvg?.id)
  const { colorMap, updateColor, resetColor, resetAll, applyPalette, undo, redo } = useColorMap(
    initialColorMap
  )
  const [homogenizeFactor, setHomogenizeFactor] = useState(0)
  const previewColorMap = useMemo(
    () => homogenizeFactor > 0.01 ? homogenizeColorMap(colorMap, homogenizeFactor) : colorMap,
    [colorMap, homogenizeFactor],
  )
  const { previewSvg } = usePreview(activeSvg?.raw ?? null, previewColorMap)
  const galleries = usePaletteGallery(activeSvg?.raw ?? null, colors, contrastMap)

  // ── Persist to localStorage + URL hash ──
  useEffect(() => {
    if (!hydrated) { setHydrated(true); return }
    persist(svgs, colorMap, svgs.indexOf(activeSvg!))
  }, [svgs, colorMap, persist, hydrated])

  useEffect(() => {
    if (!hydrated || !activeSvg) return
    pushUrl(activeSvg.raw, activeSvg.fileName, colorMap)
  }, [activeSvg?.raw, colorMap, pushUrl, hydrated])

  // ── Image palette extraction ──
  const handleImagePalette = useCallback((colors: string[], file: File) => {
    // Apply extracted colors directly as a palette
    if (colors.length === 0) return
    const entries = colors
      .filter((c) => !isNearBlackOrWhite(c))
      .map((c, i) => ({
        original: colors[i % colors.length],
        replacement: c,
      }))
    if (entries.length > 0) {
      setLastAppliedPalette(colors)
      applyPalette(entries.map((e) => ({ original: e.original, replacement: e.replacement })))
    }
  }, [applyPalette])

  // ── State ──
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<ColorEntry | null>(null)
  const [tab, setTab] = useState<Tab>('trending')
  const [viewTab, setViewTab] = useState<ViewTab>('svg')
  const [lastAppliedPalette, setLastAppliedPalette] = useState<string[] | null>(null)
  const [lastAppliedPaletteName, setLastAppliedPaletteName] = useState<string | null>(null)
  const [paletteRotation, setPaletteRotation] = useState(0)
  const [helpOpen, setHelpOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setLastAppliedPalette(null)
    setPaletteRotation(0)
  }, [activeSvg?.id])

  // ── Handlers ──
  const handleColorSelect = (entry: ColorEntry) => {
    setSelectedEntry(entry)
    setSelectedColor(entry.normalized)
  }

  const closePicker = useCallback(() => {
    setSelectedEntry(null)
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
    }
  }, [colors, colorMap])

  const handleApplyPalette = useCallback((paletteColors: string[], paletteName?: string) => {
    const filtered = paletteColors.filter((c) => !isNearBlackOrWhite(c))
    if (filtered.length === 0) return
    const assignOffset = paletteRotation % filtered.length
    const entries = colors.map((c, i) => ({
      original: c.original,
      replacement: filtered[(i + assignOffset) % filtered.length],
    }))
    setLastAppliedPalette(filtered)
    setLastAppliedPaletteName(paletteName ?? null)
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
    clearSession()
    clearUrl()
    setTimeout(() => window.location.reload(), 50)
  }

  // ── Keyboard shortcuts ──
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onReset: handleReset,
    onExport: () => setExportOpen(true),
    onExportCss: () => setExportOpen(true),
    onHelp: () => setHelpOpen(true),
  })

  // ── Derived ──
  const themeColors = (() => {
    const sorted = [...colors].sort((a, b) => b.elementCount - a.elementCount)
    return sorted.slice(0, 3).map((c) => colorMap[c.original] ?? c.normalized)
  })()

  // ── Shared tab bar component ──
  const renderTabBar = (vertical?: boolean) => (
    <div className={`${vertical ? 'flex-col' : 'flex'} gap-1`}>
      {(['trending', 'harmonies', 'palettes', 'gallery'] as Tab[]).map((t) => (
        <button
          key={t}
          onClick={() => { setTab(t); setSidebarOpen(false) }}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all
            ${tab === t
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'}`}
          title={TAB_LABELS[t]}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={TAB_ICONS[t]} />
          </svg>
          <span className={vertical ? '' : 'hidden sm:inline'}>{TAB_LABELS[t]}</span>
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 font-sans antialiased text-neutral-900">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-neutral-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Logo size={28} />
            <div className="leading-tight">
              <h1 className="text-sm font-semibold text-neutral-900">Chroma</h1>
              <p className="text-[10px] text-neutral-400">SVG Color Studio</p>
            </div>
          </div>

          {hasSvgs && (
            <>
              {svgs.length > 1 && (
                <div className="flex-1 min-w-0 hidden sm:block">
                  <SvgTabBar
                    svgs={svgs}
                    activeId={activeSvg?.id ?? null}
                    onSelect={setActive}
                    onClose={removeSvg}
                  />
                </div>
              )}
              <div className="flex items-center gap-1 shrink-0">
                <Tooltip content="Export (Cmd+E)">
                  <button
                    onClick={() => setExportOpen(true)}
                    className="min-w-[44px] h-9 px-3 flex items-center justify-center text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-all active:scale-95 shadow-sm"
                  >
                    Export
                  </button>
                </Tooltip>
                <Tooltip content="Reset all colors (R)">
                  <button
                    onClick={handleReset}
                    className="min-w-[44px] h-9 px-3 flex items-center justify-center text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-all active:scale-95"
                  >
                    Reset
                  </button>
                </Tooltip>
                <Tooltip content="Keyboard shortcuts (?)">
                  <button
                    onClick={() => setHelpOpen(true)}
                    className="min-w-[44px] h-9 flex items-center justify-center text-xs font-bold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-all active:scale-95"
                  >
                    ?
                  </button>
                </Tooltip>
                {/* Mobile sidebar toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="min-w-[44px] h-9 flex items-center justify-center text-neutral-500 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-all lg:hidden active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">

        {/* Empty state */}
        {!hasSvgs && (
          <SvgUploader
            onFile={loadFile}
            onImagePalette={hasSvgs ? handleImagePalette : undefined}
            hasFile={false}
          />
        )}

        {/* Error */}
        {loaderError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {loaderError}
          </div>
        )}

        {/* Workspace */}
        {hasSvgs && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── LEFT: Preview (3/5) ── */}
            <div className="lg:col-span-3 space-y-5 min-w-0">

              {/* Preview tabs */}
              <div className="flex items-center justify-between gap-3">
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
                <Tooltip content="Export recolored SVG">
                  <button
                    onClick={() => setExportOpen(true)}
                    className="min-w-[44px] h-9 px-3 flex items-center justify-center text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-all active:scale-95 shadow-sm"
                  >
                    Export
                  </button>
                </Tooltip>
              </div>

              {/* Preview */}
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
                      <p className="text-[11px] text-neutral-400">{colors.length} colors detected &middot; click to edit</p>
                    </div>
                  </div>
                  <HomogenizeSlider
                    value={homogenizeFactor}
                    onChange={setHomogenizeFactor}
                  />
                  <ColorList
                    colors={colors}
                    colorMap={colorMap}
                    onColorSelect={(entry) => { handleColorSelect(entry); setSidebarOpen(true) }}
                    selectedColor={selectedColor}
                  />
                </div>
              )}
            </div>

            {/* ── RIGHT: Sidebar (2/5) ── */}
            {/* Desktop */}
            <div className="hidden lg:block lg:col-span-2 space-y-4 min-w-0">
              <SidebarContent
                tab={tab}
                renderTabBar={() => renderTabBar()}
                galleries={galleries}
                handleApplyPalette={handleApplyPalette}
                handlePaletteSelect={handlePaletteSelect}
                themeColors={themeColors}
                lastAppliedPalette={lastAppliedPalette}
                selectedEntry={selectedEntry}
                colorMap={colorMap}
                closePicker={closePicker}
                updateColor={updateColor}
                resetColor={resetColor}
              />
            </div>

            {/* Mobile drawer */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-30 lg:hidden">
                <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
                <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-neutral-50 shadow-xl overflow-y-auto animate-slide-up">
                  <div className="p-4 space-y-4">
                    <SidebarContent
                      tab={tab}
                      renderTabBar={() => renderTabBar(true)}
                      galleries={galleries}
                      handleApplyPalette={handleApplyPalette}
                      handlePaletteSelect={handlePaletteSelect}
                      themeColors={themeColors}
                      lastAppliedPalette={lastAppliedPalette}
                      selectedEntry={selectedEntry}
                      colorMap={colorMap}
                      closePicker={() => { closePicker(); setSidebarOpen(false) }}
                      updateColor={updateColor}
                      resetColor={resetColor}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Export Dialog ── */}
      <ExportDialog
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        svgContent={previewSvg}
        colorMap={colorMap}
        svgName={activeSvg?.fileName.replace(/\.svg$/i, '') ?? 'colors'}
        paletteName={lastAppliedPaletteName}
      />

      {/* ── Help Dialog ── */}
      <Dialog isOpen={helpOpen} onClose={() => setHelpOpen(false)} title="Keyboard shortcuts">
        <div className="space-y-3 text-sm">
          {[
            { keys: 'Ctrl+Z', label: 'Undo last color change' },
            { keys: 'Ctrl+Shift+Z', label: 'Redo last undo' },
            { keys: 'R', label: 'Reset all colors to original' },
            { keys: 'E', label: 'Open export dialog' },
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

// ── Sidebar Content (shared between desktop and mobile) ──
function SidebarContent({
  tab,
  renderTabBar,
  galleries,
  handleApplyPalette,
  handlePaletteSelect,
  themeColors,
  lastAppliedPalette,
  selectedEntry,
  colorMap,
  closePicker,
  updateColor,
  resetColor,
}: {
  tab: Tab
  renderTabBar: () => React.ReactNode
  galleries: any[]
  handleApplyPalette: (colors: string[]) => void
  handlePaletteSelect: (color: PaletteColor) => void
  themeColors: string[]
  lastAppliedPalette: string[] | null
  selectedEntry: ColorEntry | null
  colorMap: Record<string, string>
  closePicker: () => void
  updateColor: (orig: string, repl: string) => void
  resetColor: (orig: string) => void
}) {
  return (
    <>
      {/* Tab bar (vertical on mobile, horizontal on desktop) */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-3">
        <div className="lg:hidden">{renderTabBar()}</div>
        <div className="hidden lg:block">{renderTabBar()}</div>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
        {tab === 'trending' && (
          <section>
            <p className="text-[11px] text-neutral-400 mb-3">Popular color palettes from the community</p>
                    <TrendingPalettes onApply={handleApplyPalette} selectedPalette={lastAppliedPalette} />
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
                    <PaletteGallery galleries={galleries} onApplyPalette={handleApplyPalette} selectedPalette={lastAppliedPalette} />
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
            <button onClick={closePicker} className="text-xs text-neutral-400 hover:text-neutral-600 min-w-[44px] h-9">
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
    </>
  )
}
