import { useCallback, useRef, useState, type DragEvent } from 'react'

interface SvgUploaderProps {
  onFile: (file: File) => void
  onImagePalette?: (colors: string[], file: File) => void
  hasFile: boolean
}

export function SvgUploader({ onFile, onImagePalette, hasFile }: SvgUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (!file) return
      if (file.name.toLowerCase().endsWith('.svg')) {
        onFile(file)
      } else if (file.type.startsWith('image/') && onImagePalette) {
        extractImagePalette(file, onImagePalette)
      }
    },
    [onFile, onImagePalette]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.name.toLowerCase().endsWith('.svg')) {
        onFile(file)
      } else if (file.type.startsWith('image/') && onImagePalette) {
        extractImagePalette(file, onImagePalette)
      }
    },
    [onFile, onImagePalette]
  )

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
        ${isDragging ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-300 ring-offset-2 shadow-lg shadow-primary-100' : hasFile ? 'border-neutral-200 bg-neutral-50/50' : 'border-neutral-300 hover:border-neutral-400 hover:shadow-md'}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".svg,image/png,image/jpeg,image/webp"
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-3">
        <svg className="w-12 h-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-lg font-medium text-neutral-700">Drop an SVG file here</p>
        <p className="text-sm text-neutral-500">or click to browse &middot; PNG / JPG / WEBP supported for palette extraction</p>
      </div>
    </div>
  )
}

async function extractImagePalette(file: File, onPalette: (colors: string[], file: File) => void) {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const maxDim = 200
    let w = img.naturalWidth, h = img.naturalHeight
    if (w > maxDim || h > maxDim) {
      const scale = maxDim / Math.max(w, h)
      w = Math.round(w * scale)
      h = Math.round(h * scale)
    }
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, w, h)
    const imageData = ctx.getImageData(0, 0, w, h)
    const colors = extractDominantColors(imageData)
    URL.revokeObjectURL(url)
    onPalette(colors, file)
  }
  img.onerror = () => URL.revokeObjectURL(url)
  img.src = url
}

export function extractDominantColors(imageData: ImageData, k = 6): string[] {
  const data = imageData.data
  const pixels: number[][] = []
  for (let y = 0; y < imageData.height; y += 3) {
    for (let x = 0; x < imageData.width; x += 3) {
      const i = (y * imageData.width + x) * 4
      if (data[i + 3] < 128) continue
      pixels.push([data[i], data[i + 1], data[i + 2]])
    }
  }
  if (pixels.length === 0) return ['#808080']

  const centroids: number[][] = []
  for (let i = 0; i < k; i++) {
    centroids.push(pixels[Math.floor(Math.random() * pixels.length)].slice())
  }
  const counts = new Array(k).fill(0)
  const sums = Array.from({ length: k }, () => [0, 0, 0])
  const clusterPixels: number[][][] = Array.from({ length: k }, () => [])

  const dist = (a: number[], b: number[]) => {
    const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]
    return dr * dr + dg * dg + db * db
  }

  for (let iter = 0; iter < 10; iter++) {
    for (let i = 0; i < k; i++) { sums[i] = [0, 0, 0]; counts[i] = 0; clusterPixels[i] = [] }
    for (let i = 0; i < pixels.length; i++) {
      let best = 0, bestDist = Infinity
      for (let j = 0; j < k; j++) {
        const d = dist(pixels[i], centroids[j])
        if (d < bestDist) { bestDist = d; best = j }
      }
      clusterPixels[best].push(pixels[i])
      sums[best][0] += pixels[i][0]
      sums[best][1] += pixels[i][1]
      sums[best][2] += pixels[i][2]
      counts[best]++
    }
    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        centroids[j] = [sums[j][0] / counts[j], sums[j][1] / counts[j], sums[j][2] / counts[j]]
      }
    }
  }

  return centroids
    .map((c, i) => {
      if (clusterPixels[i].length === 0) return null
      const nearest = clusterPixels[i].reduce((best, px) =>
        dist(px, c) < dist(best, c) ? px : best
      )
      return { c: nearest, count: counts[i] }
    })
    .filter((x): x is { c: number[]; count: number } => x !== null)
    .sort((a, b) => b.count - a.count)
    .map(x => '#' + x.c.map((v) => v.toString(16).padStart(2, '0')).join(''))
}
