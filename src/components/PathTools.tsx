import { useState, useMemo } from 'react'
import { getPathPoints, findCloseVertices, simplifySvg, type VertexIssue } from '../lib/svg-path-utils'

interface PathToolsProps {
  svgRaw: string
  onSimplify: (newRaw: string) => void
  showVertices: boolean
  onToggleVertices: (v: boolean) => void
}

export function PathTools({ svgRaw, onSimplify, showVertices, onToggleVertices }: PathToolsProps) {
  const [issues, setIssues] = useState<VertexIssue[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [simplified, setSimplified] = useState(false)

  const allData = useMemo(() => getPathPoints(svgRaw), [svgRaw])
  const vertexCount = useMemo(() => allData.reduce((s, p) => s + p.points.length, 0), [allData])

  const handleSimplify = () => {
    const result = simplifySvg(svgRaw, 1)
    if (result !== svgRaw) {
      onSimplify(result)
      setSimplified(true)
      setIssues([])
    }
  }

  const handleScan = () => {
    setIsScanning(true)
    const found = findCloseVertices(svgRaw, 2)
    setIssues(found)
    setIsScanning(false)
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
      <div className="flex items-center gap-1.5 p-2 border-b border-neutral-100 overflow-x-auto">
        <button
          onClick={handleSimplify}
          disabled={simplified}
          className="shrink-0 h-7 px-2.5 text-[10px] font-medium rounded-lg transition-all border disabled:opacity-40 disabled:cursor-not-allowed
            text-primary-600 border-primary-200 bg-primary-50 hover:bg-primary-100 active:scale-95"
          title="Simplificar paths con Ramer-Douglas-Peucker: elimina vértices redundantes en líneas rectas y curvas suaves, reduciendo el tamaño del SVG sin pérdida visual apreciable."
        >
          ✂ Simplify
        </button>
        <button
          onClick={() => onToggleVertices(!showVertices)}
          className={`shrink-0 h-7 px-2.5 text-[10px] font-medium rounded-lg transition-all border active:scale-95
            ${showVertices
              ? 'bg-primary-500 text-white border-primary-400 shadow-sm'
              : 'text-neutral-600 border-neutral-200 bg-white hover:bg-neutral-50'}`}
          title="Mostrar puntos de control (vértices) de cada path superpuestos en el SVG. Los puntos rojos indican vértices problemáticos detectados."
        >
          ◎ Vertices {showVertices ? 'ON' : 'OFF'}
        </button>
        <div className="w-px h-5 bg-neutral-200 shrink-0" />
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="shrink-0 h-7 px-2.5 text-[10px] font-medium rounded-lg transition-all border active:scale-95
            text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Detectar vértices separados por menos de 2px que generan segmentos invisiblemente pequeños o colineales. Útil para encontrar autotrazao o errores de exportación."
        >
          ⚡ Detect issues
        </button>
        {issues.length > 0 && (
          <span className="shrink-0 text-[10px] text-amber-600 font-medium ml-0.5">
            {issues.length}
          </span>
        )}
      </div>

      {issues.length > 0 && (
        <div className="px-3 py-2 bg-amber-50/50 border-b border-amber-100 text-[10px] text-amber-700 space-y-0.5 max-h-24 overflow-y-auto">
          {issues.slice(0, 20).map((iss, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              P{iss.pathIndex + 1}·V{iss.index}: ({iss.point.x.toFixed(0)},{iss.point.y.toFixed(0)})→({iss.nextPoint.x.toFixed(0)},{iss.nextPoint.y.toFixed(0)}) — {iss.distance.toFixed(1)}px
            </div>
          ))}
          {issues.length > 20 && (
            <div className="text-amber-500 italic">…{issues.length - 20} more</div>
          )}
        </div>
      )}

      <div className="px-3 py-1.5 flex items-center gap-3 text-[10px] text-neutral-400">
        <span>{vertexCount} vertices</span>
        <span className="w-px h-3 bg-neutral-200" />
        <span>{allData.length} paths</span>
        {simplified && (
          <>
            <span className="w-px h-3 bg-neutral-200" />
            <span className="text-green-600 font-medium">✓ Simplified</span>
          </>
        )}
      </div>
    </div>
  )
}
