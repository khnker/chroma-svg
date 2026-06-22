import { useState, useEffect } from 'react'

export interface TrendingPalette {
  id: string
  hexes: string[]
  name: string
  count: string
}

export function useTrendingPalettes() {
  const [palettes, setPalettes] = useState<TrendingPalette[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchTrending = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/trending-palettes.json?_=${Date.now()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setPalettes(data)
      if (data.length === 0) setError('No se encontraron paletas')
    } catch {
      setError('Error al cargar paletas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTrending() }, [])

  return { palettes, loading, error, refetch: fetchTrending }
}
