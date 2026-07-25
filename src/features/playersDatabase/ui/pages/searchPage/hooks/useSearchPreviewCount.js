// features/playersDatabase/ui/pages/searchPage/hooks/useSearchPreviewCount.js

import * as React from 'react'

import { readSearchPageCount } from '../../../../services/read/index.js'

export default function useSearchPreviewCount({
  queryFilters,
  queryFiltersKey,
}) {
  const [previewCount, setPreviewCount] = React.useState(0)
  const [previewLoading, setPreviewLoading] = React.useState(true)
  const [previewError, setPreviewError] = React.useState(null)

  React.useEffect(() => {
    let active = true

    setPreviewLoading(true)
    setPreviewError(null)

    readSearchPageCount({ filters: queryFilters })
      .then(count => {
        if (!active) return
        setPreviewCount(count)
        setPreviewLoading(false)
      })
      .catch(error => {
        if (!active) return
        setPreviewCount(0)
        setPreviewError(error)
        setPreviewLoading(false)
      })

    return () => {
      active = false
    }
  }, [queryFiltersKey, queryFilters])

  return {
    previewCount,
    previewLoading,
    previewError,
  }
}
