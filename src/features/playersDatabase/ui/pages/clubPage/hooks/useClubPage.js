// src/features/playersDatabase/ui/pages/clubPage/hooks/useClubPage.js

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { readClubPageData } from '../../../../services/read/index.js'
import { getCachedClubPageData } from '../../../../services/read/pages/clubs.read.js'
import { buildClubPageModel } from '../../../../model/pages/clubPresentation.model.js'
import {
  buildClubIntelligenceFromCanonicalSources,
} from '../../../../domain/clubIntelligence/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export default function useClubPage({ clubId } = {}) {
  const normalizedClubId = clean(clubId)
  const [loadedSource, setSource] = useState(() => getCachedClubPageData(normalizedClubId))
  const [status, setStatus] = useState({ clubId: normalizedClubId, pending: true, error: '' })
  const requestId = useRef(0)
  const source = loadedSource?.clubId === normalizedClubId
    ? loadedSource
    : getCachedClubPageData(normalizedClubId)
  const currentStatus = status.clubId === normalizedClubId
    ? status
    : { pending: true, error: '' }
  const loading = Boolean(normalizedClubId && !source && currentStatus.pending)
  const refreshing = Boolean(source && currentStatus.pending)
  const error = source ? '' : currentStatus.error
  const refreshError = source ? currentStatus.error : ''

  const load = useCallback(async ({ refresh = false } = {}) => {
    const currentRequest = ++requestId.current
    if (!normalizedClubId) {
      setSource(null)
      setStatus({ clubId: normalizedClubId, pending: false, error: '' })
      return null
    }

    setStatus({ clubId: normalizedClubId, pending: true, error: '' })

    try {
      const nextSource = await readClubPageData({
        clubId: normalizedClubId,
        refresh,
      })
      if (currentRequest === requestId.current) setSource(nextSource)
      return nextSource
    } catch (loadError) {
      const message = loadError?.message || 'טעינת המועדון נכשלה'
      if (currentRequest === requestId.current) {
        setStatus({ clubId: normalizedClubId, pending: false, error: message })
      }
      throw loadError
    } finally {
      if (currentRequest === requestId.current) {
        setStatus(previous => ({ ...previous, pending: false }))
      }
    }
  }, [normalizedClubId])

  const reload = useCallback(() => load({ refresh: true }), [load])

  useEffect(() => {
    load().catch(() => {})
    return () => { requestId.current += 1 }
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
