import { useTrendingPalettes } from '@/hooks/useTrendingPalettes'

interface TrendingPalettesProps {
  onApply: (colors: string[]) => void
  selectedPalette?: string[] | null
}

export function TrendingPalettes({ onApply, selectedPalette }: TrendingPalettesProps) {
  const { palettes, loading, error, refetch } = useTrendingPalettes()

  const isSelected = (hexes: string[]) =>
    selectedPalette !== null && selectedPalette !== undefined &&
    selectedPalette.length === hexes.length &&
    selectedPalette.every((c, i) => c.toLowerCase() === hexes[i].toLowerCase())

  return (
    <div className="space-y-3">
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
      {palettes.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {palettes.map((p) => {
            const sel = isSelected(p.hexes)
            return (
              <div
                key={p.id}
                onClick={() => onApply(p.hexes)}
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
                    Click to re-apply &middot; colors will rotate
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
