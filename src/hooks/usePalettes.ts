import { useState, useMemo } from 'react'
import { predefinedPalettes, findPalettes } from '@/lib/palette-data'

export function usePalettes() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPalettes = useMemo(() => {
    if (!searchQuery.trim()) return predefinedPalettes
    return findPalettes(searchQuery)
  }, [searchQuery])

  return {
    palettes: filteredPalettes,
    searchQuery,
    setSearchQuery,
  }
}
