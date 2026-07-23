// features/playersDatabase/ui/hooks/useSearchPage.js

import { useEffect, useMemo, useState } from 'react'

import { buildSearchPageView } from '../../model/searchPage.model.js'
import { readSearchPageData } from '../../services/read/index.js'

const EMPTY_VIEW = {
  rows: [],
  summary: {
    total: 0,
    highReliability: 0,
    saved: 0,
    interesting: 0,
  },
  activityItems: [],
  totalCount: 0,
}

export function useSearchPage(filters = {}) {
  const [view, setView] = useState(EMPTY_VIEW)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const filtersKey = useMemo(() => JSON.stringify(filters || {}), [filters])

  useEffect(() => {
    let active = true

    setLoading(true)
    setError(null)

    readSearchPageData({ filters })
      .then(data => {
        if (!active) return

        const builtView = buildSearchPageView(data.rows || [])

        setView({
          rows: builtView.results,
          summary: {
            ...builtView.summary,
            total: data.totalCount || 0,
          },
          activityItems: builtView.activityItems,
          totalCount: data.totalCount || 0,
        })
        setLoading(false)
      })
      .catch(nextError => {
        if (!active) return

        setView(EMPTY_VIEW)
        setError(nextError)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filters, filtersKey])

  return {
    ...view,
    loading,
    error,
  }
}
