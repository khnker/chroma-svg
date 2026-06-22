import { useTrendingPalettes } from '@/hooks/useTrendingPalettes'

interface TrendingPalettesProps {
  onApply: (colors: string[]) => void
}

export function TrendingPalettes({ onApply }: TrendingPalettesProps) {
  const { palettes, loading, error, refetch } = useTrendingPalettes()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Trending on Coolors</h4>
        <button
          onClick={refetch}
          disabled={loading}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {palettes.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {palettes.map((p) => (
            <div
              key={p.id}
              className="group relative rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
            >
              <div className="flex h-10">
                {p.hexes.map((c, i) => (
                  <div key={i} className="flex-1 first:rounded-l-lg last:rounded-r-lg" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                <button
                  onClick={() => onApply(p.hexes)}
                  className="px-3 py-1 text-xs bg-white text-gray-800 rounded-lg shadow-md font-medium hover:bg-gray-50"
                >
                  Apply 🎲
                </button>
              </div>
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-gray-700 truncate">{p.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{p.hexes.join(' · ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && palettes.length === 0 && !error && (
        <p className="text-xs text-gray-400">Run <code className="bg-gray-100 px-1 rounded">node scripts/scrape-trending.cjs</code> to fetch trending palettes</p>
      )}
    </div>
  )
}
