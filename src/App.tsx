import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { SvgUploader, extractDominantColors } from './components/SvgUploader'
import { SvgPreview } from './components/SvgPreview'
import { SvgTabBar } from './components/SvgTabBar'
import { ColorList } from './components/ColorList'
import { ColorPopover } from './components/ColorPopover'
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
import { isNearBlackOrWhite, generateColorScale } from './lib/color-utils'
import { homogenizeColorMap } from './lib/homogenize'
import { HomogenizeSlider } from './components/HomogenizeSlider'
import { ThemePreview } from './components/ThemePreview'
import type { ColorEntry, PaletaCustom } from './core/types'

type Tab = 'palettes' | 'previews'
type ViewTab = 'svg' | 'theme'

export default function App() {
  // ── Storage & URL ──
  const { initialSvgs, initialColorMap, persist } = useStorage()
  const { initialState: urlState, pushState: pushUrl } = useUrlState()
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
  const [customPalettes, setCustomPalettes] = useState<PaletaCustom[]>([])
  const [bgMode, setBgMode] = useState<'checker' | 'white' | 'black'>('checker')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [extracting, setExtracting] = useState(false)
  const galleries = usePaletteGallery(activeSvg?.raw ?? null, colors, contrastMap, customPalettes)

  // ── Site theme (3 colores dominantes → primary/accent/tertiary) ──
  const siteTheme = useMemo(() => {
    if (colors.length === 0) return {}
    const sorted = [...colors].sort((a, b) => b.elementCount - a.elementCount)
    const top3 = [0, 1, 2].map(i => {
      const c = sorted[i]
      if (!c) return null
      return previewColorMap[c.original] ?? c.normalized
    }) as (string | null)[]
    const [c1, c2, c3] = top3
    if (!c1) return {}
    const scale = (hex: string) => generateColorScale(hex) ?? {}
    const s1 = scale(c1); const s2 = c2 ? scale(c2) : {}; const s3 = c3 ? scale(c3) : {}
    const fill = (s: Record<string, string>, hex: string) => (stop: string) => s[stop] ?? hex
    const f1 = fill(s1, c1); const f2 = fill(s2, c2 ?? c1); const f3 = fill(s3, c3 ?? c1)
    const stops = ['50','100','200','300','400','500','600','700','800','900','950'] as const
    const prefix = ['primary', 'accent', 'tertiary']
    const scales = [f1, f2, f3]
    const vars: Record<string, string> = {}
    for (let i = 0; i < 3; i++) {
      for (const s of stops) { vars[`--color-${prefix[i]}-${s}`] = scales[i](s) }
    }
    return vars
  }, [previewColorMap, colors])

  // ── Persist ──
  useEffect(() => {
    if (!hydrated) { setHydrated(true); return }
    persist(svgs, colorMap, svgs.indexOf(activeSvg!))
  }, [svgs, colorMap, persist, hydrated])

  useEffect(() => {
    if (!hydrated || !activeSvg) return
    pushUrl(activeSvg.raw, activeSvg.fileName, colorMap)
  }, [activeSvg?.raw, colorMap, pushUrl, hydrated])

  useEffect(() => {
    document.documentElement.dataset.theme = bgMode === 'black' ? 'dark' : 'light'
  }, [bgMode])

  // ── State ──
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<ColorEntry | null>(null)
  const [tab, setTab] = useState<Tab>('palettes')
  const [viewTab, setViewTab] = useState<ViewTab>('svg')
  const [lastAppliedPalette, setLastAppliedPalette] = useState<string[] | null>(null)
  const [lastAppliedPaletteName, setLastAppliedPaletteName] = useState<string | null>(null)
  const [paletteRotation, setPaletteRotation] = useState(0)
  const [helpOpen, setHelpOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [popoverPos, setPopoverPos] = useState<{ x: number, y: number } | null>(null)

  useEffect(() => {
    setLastAppliedPalette(null)
    setLastAppliedPaletteName(null)
    setPaletteRotation(0)
  }, [activeSvg?.id])

  // ── Handlers ──
  const handleColorSelect = (entry: ColorEntry) => {
    setSelectedEntry(entry)
    setSelectedColor(entry.normalized)
  }

  const closePopover = useCallback(() => {
    setPopoverPos(null)
  }, [])

  const removeCustomPalette = useCallback((i: number) => {
    setCustomPalettes(prev => prev.filter((_, idx) => idx !== i))
  }, [])

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
      setPopoverPos({ x: e.clientX, y: e.clientY })
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
    setLastAppliedPaletteName(null)
    setHomogenizeFactor(0)
    resetAll()
  }

  const handleImageExtract = useCallback(async (file: File) => {
    setExtracting(true)
    try {
      const url = URL.createObjectURL(file)
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject()
        img.src = url
      })
      const canvas = document.createElement('canvas')
      const maxDim = 200
      let w = img.naturalWidth, h = img.naturalHeight
      if (w > maxDim || h > maxDim) { const s = maxDim / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s) }
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      const colors = extractDominantColors(ctx.getImageData(0, 0, w, h))
      URL.revokeObjectURL(url)
      if (colors.length > 0) {
        const name = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]/g, ' ').trim() || 'Imagen'
        setCustomPalettes(prev => [...prev, { name, colors }])
      }
    } catch (e) {
      console.error('Image extraction failed:', e)
    } finally {
      setExtracting(false)
    }
  }, [])

  // ── Keyboard shortcuts ──
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onReset: handleReset,
    onExport: () => setExportOpen(true),
    onHelp: () => setHelpOpen(true),
  })

  return (
    <div
      className="min-h-screen bg-neutral-50 font-sans antialiased text-neutral-900"
      style={siteTheme as React.CSSProperties}
    >

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">

        {!hasSvgs && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="opacity-90"><Logo size={72} /></div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-800">
                Chroma SVG
              </h1>
              <p className="text-neutral-500 max-w-md text-sm sm:text-base leading-relaxed">
                Recolor any SVG file in seconds. Upload your SVG, tweak colors with a live preview,
                and export the result — no design tools needed.
              </p>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span>🎯 Click to recolor</span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span>🔄 Live preview</span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span>📤 Export SVG</span>
              </div>
            </div>
            <div className="w-full max-w-md">
              <SvgUploader onFile={loadFile} onImagePalette={(colors) => {
                if (colors.length > 0) handleApplyPalette(colors, 'image')
              }} hasFile={false} />
            </div>
          </div>
        )}

        {loaderError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {loaderError}
          </div>
        )}

        {hasSvgs && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-6 gap-y-6">

            {/* ── ROW 1: Top bar (5 cols) ── */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-neutral-200 shadow-sm px-3 sm:px-4 py-3">

                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
                  <div className="shrink-0"><Logo size={20} /></div>

                  <SvgTabBar
                    svgs={svgs.map(s => ({ id: s.id, fileName: s.fileName, raw: s.raw }))}
                    activeId={activeSvg?.id ?? null}
                    onSelect={setActive}
                    onClose={removeSvg}
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-0.5 shadow-sm">
                    {(['checker', 'white', 'black'] as const).map(m => (
                      <Tooltip key={m} content={m === 'checker' ? 'Transparent' : m === 'white' ? 'White' : 'Black'}>
                        <button
                          onClick={() => setBgMode(m)}
                          className={`h-6 w-6 rounded-md text-[8px] font-bold flex items-center justify-center transition-all
                            ${bgMode === m
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'text-neutral-500 hover:text-neutral-700'}`}
                          style={m === 'checker' && bgMode !== m ? { background: 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 6px 6px' } : {}}
                        >
                          {m === 'checker' ? 'T' : m === 'white' ? 'W' : 'B'}
                        </button>
                      </Tooltip>
                    ))}
                  </div>

                  <div className="flex rounded-lg border border-neutral-200 bg-white p-0.5 shadow-sm">
                    {(['svg', 'theme'] as ViewTab[]).map((vt) => (
                      <button
                        key={vt}
                        onClick={() => setViewTab(vt)}
                        className={`h-6 px-2 text-[10px] font-medium rounded-md transition-all whitespace-nowrap
                          ${viewTab === vt
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700'}`}
                      >
                        {vt === 'svg' ? 'SVG' : 'Theme'}
                      </button>
                    ))}
                  </div>

                  <div className="flex rounded-lg border border-neutral-200 bg-white p-0.5 shadow-sm">
                    {(['palettes', 'previews'] as Tab[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`h-6 px-2 text-[10px] font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1
                          ${tab === t
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700'}`}
                      >
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={t === 'palettes'
                            ? 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4'
                            : 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7'} />
                        </svg>
                        {t === 'palettes' ? 'P' : 'Pr'}
                      </button>
                    ))}
                  </div>

                  <Tooltip content="Export recolored SVG">
                    <button
                      onClick={() => setExportOpen(true)}
                      className="h-6 px-2 text-[10px] font-medium text-white bg-accent-500 hover:bg-accent-600 rounded-lg transition-all active:scale-95 shadow-sm"
                    >
                      Export
                    </button>
                  </Tooltip>

                  <Tooltip content="Add another SVG file">
                    <button
                      onClick={() => document.getElementById('svg-file-input')?.click()}
                      className="h-6 px-2 flex items-center gap-0.5 text-[10px] font-semibold text-white bg-accent-600 hover:bg-accent-700 rounded-lg transition-all active:scale-95 shadow-sm"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </Tooltip>

                  <Tooltip content="Help (?)">
                    <button
                      onClick={() => setHelpOpen(true)}
                      className="h-6 w-6 flex items-center justify-center text-[10px] font-bold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-all active:scale-95"
                    >
                      ?
                    </button>
                  </Tooltip>

                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="h-6 w-6 flex items-center justify-center text-neutral-500 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-all lg:hidden active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                    </svg>
                  </button>
                </div>

              </div>
            </div>

            {/* ── ROW 2: Content ── */}
            <div className="lg:col-span-3 space-y-5 min-w-0">

              {viewTab === 'svg' ? (
                <SvgPreview
                  svgContent={previewSvg}
                  onColorClick={handleSvgColorClick}
                  bgMode={bgMode}
                />
              ) : (
                <ThemePreview colorMap={previewColorMap} svgName={activeSvg?.fileName.replace(/\.svg$/i, '') ?? 'colors'} />
              )}

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
                    colorMap={previewColorMap}
                    onColorSelect={(entry, e) => { handleColorSelect(entry); setPopoverPos({ x: e.clientX, y: e.clientY }) }}
                    selectedColor={selectedColor}
                  />
                </div>
              )}

            </div>

            <div className="hidden lg:block lg:col-span-2 min-w-0 lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
              <SidebarContent
                tab={tab}
                galleries={galleries}
                handleApplyPalette={handleApplyPalette}
                lastAppliedPalette={lastAppliedPalette}
                customPalettes={customPalettes}
                onRemoveCustomPalette={removeCustomPalette}
                extracting={extracting}
                onExtractClick={() => imageInputRef.current?.click()}
              />
            </div>

            {sidebarOpen && (
              <div className="fixed inset-0 z-30 lg:hidden">
                <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
                <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-neutral-50 shadow-xl overflow-y-auto animate-slide-up">
                  <div className="p-4 space-y-4">
                    <div className="flex rounded-lg border border-neutral-200 bg-white p-0.5 shadow-sm w-fit">
                      {(['palettes', 'previews'] as Tab[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTab(t)}
                          className={`h-8 flex items-center gap-2 px-4 text-xs font-medium rounded-md transition-all
                            ${tab === t
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={t === 'palettes'
                              ? 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4'
                              : 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7'} />
                          </svg>
                          {t === 'palettes' ? 'Palettes' : 'Previews'}
                        </button>
                      ))}
                    </div>
                    <SidebarContent
                      tab={tab}
                      galleries={galleries}
                      handleApplyPalette={handleApplyPalette}
                      lastAppliedPalette={lastAppliedPalette}
                      customPalettes={customPalettes}
                      onRemoveCustomPalette={removeCustomPalette}
                      extracting={extracting}
                      onExtractClick={() => imageInputRef.current?.click()}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <ExportDialog
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        svgContent={previewSvg}
        colorMap={colorMap}
        svgName={activeSvg?.fileName.replace(/\.svg$/i, '') ?? 'colors'}
        paletteName={lastAppliedPaletteName}
      />

      {/* Hidden file input for importing additional SVGs */}
      <input
        id="svg-file-input"
        type="file"
        accept=".svg"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) { loadFile(f); e.target.value = '' } }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleImageExtract(f); e.target.value = '' } }}
      />

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

      {popoverPos && selectedEntry && (
        <ColorPopover
          x={popoverPos.x}
          y={popoverPos.y}
          current={colorMap[selectedEntry.original] ?? selectedEntry.normalized}
          original={selectedEntry.original}
          onChange={(newColor) => updateColor(selectedEntry.original, newColor)}
          onReset={() => resetColor(selectedEntry.original)}
          onClose={closePopover}
        />
      )}

    </div>
  )
}

function SidebarContent({
  tab,
  galleries,
  handleApplyPalette,
  lastAppliedPalette,
  customPalettes,
  onRemoveCustomPalette,
  extracting,
  onExtractClick,
}: {
  tab: Tab
  galleries: any[]
  handleApplyPalette: (colors: string[], paletteName?: string) => void
  lastAppliedPalette: string[] | null
  customPalettes: PaletaCustom[]
  onRemoveCustomPalette: (index: number) => void
  extracting: boolean
  onExtractClick: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 h-full overflow-y-auto">
      {tab === 'palettes' && (
        <section className="space-y-4">
          <button
            onClick={onExtractClick}
            disabled={extracting}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {extracting ? 'Extracting…' : 'From Image'}
          </button>

          {customPalettes.length > 0 && (
            <div>
              <p className="text-[11px] text-neutral-400 mb-2">
                Custom palettes from images &mdash; click to apply
              </p>
              <div className="space-y-2">
                {customPalettes.map((cp, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 hover:border-primary-300 cursor-pointer transition-colors"
                    onClick={() => handleApplyPalette(cp.colors, cp.name)}
                  >
                    <div className="flex gap-0.5 flex-1 min-w-0">
                      {cp.colors.map((c, j) => (
                        <div
                          key={j}
                          className="h-6 flex-1 first:rounded-l-md last:rounded-r-md"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-neutral-500 truncate max-w-[100px]">{cp.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveCustomPalette(i) }}
                      className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-[11px] text-neutral-400 mb-3">Trending palettes from Coolors &mdash; import your own</p>
            <TrendingPalettes onApply={handleApplyPalette} selectedPalette={lastAppliedPalette} />
          </div>
        </section>
      )}

      {tab === 'previews' && (
        <section>
          <p className="text-[11px] text-neutral-400 mb-3">Apply each palette to your SVG &mdash; preview before you commit</p>
          <PaletteGallery galleries={galleries} onApplyPalette={handleApplyPalette} selectedPalette={lastAppliedPalette} />
        </section>
      )}
    </div>
  )
}