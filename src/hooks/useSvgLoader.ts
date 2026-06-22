import { useCallback, useRef, useState } from 'react'

interface SvgLoaderOptions {
  onLoad?: (raw: string, fileName: string) => void
}

export function useSvgLoader(options?: SvgLoaderOptions) {
  const [error, setError] = useState<string | null>(null)
  const onLoadRef = useRef(options?.onLoad)
  onLoadRef.current = options?.onLoad

  const loadFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.svg')) {
      setError('Please select an SVG file')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const raw = reader.result as string
      onLoadRef.current?.(raw, file.name)
    }
    reader.onerror = () => setError('Failed to read file')
    reader.readAsText(file)
  }, [])

  const loadRaw = useCallback((svg: string, name: string) => {
    setError(null)
    onLoadRef.current?.(svg, name)
  }, [])

  return { loadFile, loadRaw, error }
}
