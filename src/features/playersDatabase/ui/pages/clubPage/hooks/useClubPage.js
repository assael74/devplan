// src/features/playersDatabase/ui/pages/clubPage/hooks/useClubPage.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { readClubPageData } from '../../../../services/read/index.js'
import { buildClubPageModel } from '../../../../model/pages/clubPresentation.model.js'
import {
  buildClubIntelligenceFromCanonicalSources,
} from '../../../../domain/clubIntelligence/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export default function useClubPage({ clubId } = {}) {
  const normalizedClubId = clean(clubId)
  const [source, setSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [refreshError, setRefreshError] = useState('')

  const load = useCallback(async ({ refresh = false } = {}) => {
    if (!normalizedClubId) {
      setSource(null)
      setLoading(false)
      return null
    }

    if (refresh) {
      setRefreshing(true)
      setRefreshError('')
    } else {
      setLoading(true)
      setError('')
    }

    try {
      const nextSource = await readClubPageData({
        clubId: normalizedClubId,
        refresh,
      })
      setSource(nextSource)
      return nextSource
    } catch (loadError) {
      const message = loadError?.message || 'טעינת המועדון נכשלה'
      if (refresh) setRefreshError(message)
      else {
        setSource(null)
        setError(message)
      }
      throw loadError
    } finally {
      if (refresh) setRefreshing(false)
      else setLoading(false)
    }
  }, [normalizedClubId])

  const reload = useCallback(() => load({ refresh: true }), [load])

  useEffect(() => {
    load().catch(() => {})
  }, [load])

  const intelligence = useMemo(() => (
    source ? buildClubIntelligenceFromCanonicalSources(source) : null
  ), [source])
  const club = intelligence?.club?.clubId ? intelligence.club : null
  const page = useMemo(() => buildClubPageModel({ intelligence }), [intelligence])
  const hasCanonicalSource = Boolean(
    source?.profile ||
    source?.directoryEntry ||
    source?.centers?.some(item => item?.document?.clubsById?.[normalizedClubId])
  )

  return {
    club,
    reload,
    intelligence,
    page,
    loading,
    refreshing,
    error,
    refreshError,
    notFound: Boolean(!loading && !error && !hasCanonicalSource),
  }
}
