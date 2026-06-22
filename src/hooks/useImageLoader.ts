import { useState, useCallback, useRef } from 'react'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const K_CLUSTERS = 6
const K_ITERATIONS = 10

interface KMeansResult {
  centroid: number[]
  count: number
}

function distance(a: number[], b: number[]) {
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]
  return dr * dr + dg * dg + db * db
}

function extractColors(imageData: ImageData, sampleStep = 4): string[] {
  const data = imageData.data
  const pixels: number[][] = []
  for (let y = 0; y < imageData.height; y += sampleStep) {
    for (let x = 0; x < imageData.width; x += sampleStep) {
      const i = (y * imageData.width + x) * 4
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
      if (a < 128) continue
      pixels.push([r, g, b])
    }
  }

  if (pixels.length === 0) return ['#808080']

  // k-means
  const centroids: number[][] = []
  for (let k = 0; k < K_CLUSTERS; k++) {
    centroids.push(pixels[Math.floor(Math.random() * pixels.length)].slice())
  }

  const counts = new Array(K_CLUSTERS).fill(0)
  const sums = Array.from({ length: K_CLUSTERS }, () => [0, 0, 0])
  const labels = new Array(pixels.length).fill(0)

  for (let iter = 0; iter < K_ITERATIONS; iter++) {
    for (let i = 0; i < K_CLUSTERS; i++) { sums[i] = [0, 0, 0]; counts[i] = 0 }
    for (let i = 0; i < pixels.length; i++) {
      let best = 0, bestDist = Infinity
      for (let k = 0; k < K_CLUSTERS; k++) {
        const d = distance(pixels[i], centroids[k])
        if (d < bestDist) { bestDist = d; best = k }
      }
      labels[i] = best
      sums[best][0] += pixels[i][0]
      sums[best][1] += pixels[i][1]
      sums[best][2] += pixels[i][2]
      counts[best]++
    }
    for (let k = 0; k < K_CLUSTERS; k++) {
      if (counts[k] > 0) {
        centroids[k] = [sums[k][0] / counts[k], sums[k][1] / counts[k], sums[k][2] / counts[k]]
      }
    }
  }

  return centroids
    .map((c) => {
      const r = Math.round(c[0]), g = Math.round(c[1]), b = Math.round(c[2])
      return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
    })
    .sort(() => Math.random() - 0.5)
}

export function useImageLoader() {
  const [loading, setLoading] = useState(false)

  const loadImage = useCallback((file: File): Promise<{ palette: string[]; previewUrl: string } | null> => {
    return new Promise((resolve) => {
      if (file.size > MAX_IMAGE_BYTES) { resolve(null); return }

      if (file.name.toLowerCase().endsWith('.svg')) {
        const reader = new FileReader()
        reader.onload = () => {
          resolve({ palette: [], previewUrl: '' })
        }
        reader.onerror = () => resolve(null)
        reader.readAsText(file)
        return
      }

      setLoading(true)
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
        const palette = extractColors(imageData)
        setLoading(false)
        URL.revokeObjectURL(url)
        resolve({ palette, previewUrl: url })
      }
      img.onerror = () => { setLoading(false); resolve(null) }
      img.src = url
    })
  }, [])

  return { loadImage, loading }
}
