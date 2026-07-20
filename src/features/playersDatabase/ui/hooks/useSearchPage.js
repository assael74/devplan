// features/playersDatabase/ui/hooks/useSearchPage.js

import { useMemo, useState } from 'react'

import { demoSearchResults } from './demoData.js'
import { filterByText } from '../logic/filters.logic.js'

export function useSearchPage() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => filterByText(demoSearchResults, query, ['playerName', 'teamName', 'leagueName', 'primaryProfile']), [query])

  return {
    query,
    setQuery,
    results,
    summary: {
      total: demoSearchResults.length,
      highReliability: demoSearchResults.filter(row => row.reliability === 'גבוהה').length,
      saved: 0,
      interesting: demoSearchResults.filter(row => row.score >= 80).length,
    },
  }
}
