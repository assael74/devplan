// features/playersDatabase/ui/hooks/useSearchPage.js

import { useEffect, useMemo, useState } from 'react'

import { buildSearchPageView } from '../../model/searchPage.model.js'
import { readSearchPageData } from '../../services/read/index.js'
import { filterByText } from '../logic/filters.logic.js'

export function useSearchPage() {
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    setLoading(true)
    setError(null)

    readSearchPageData()
      .then(data => {
        if (!active) return
        setRows(data)
        setLoading(false)
      })
      .catch(nextError => {
        if (!active) return
        setRows([])
        setError(nextError)
        setLoading(false)
      })

    return () => { active = false }
  }, [])

  const view = useMemo(
    () => buildSearchPageView(rows),
    [rows]
  )

  const results = useMemo(() => filterByText(
    view.results,
    query,
    ['playerName', 'teamName', 'leagueName', 'primaryProfile', 'secondaryProfile']
  ), [query, view.results])

  const summary = useMemo(() => ({
    total: results.length,
    highReliability: results.filter(row => row.reliability === 'גבוהה').length,
    saved: results.filter(row => row.favorite).length,
    interesting: results.filter(row => row.score >= 80).length,
  }), [results])

  return {
    query,
    setQuery,
    results,
    summary,
    activityItems: view.activityItems,
    loading,
    error,
  }
}
