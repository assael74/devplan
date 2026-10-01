// src/features/playersDatabase/ui/pages/clubPage/hooks/useClubPage.js

import {
  useCallback,
  useEffect,
  useMemo,
} from 'react'

import {
  readClubPageDocument,
  readClubsMasterDocument,
} from '../../../../services/read/index.js'
import { buildClubPageModel } from '../../../../model/pages/clubPresentation.model.js'
import {
  buildClubDocumentCacheKey,
  buildClubsMasterCacheKey,
} from '../../../../services/cache/index.js'
import usePlayersDatabaseReadStoreEntry from '../../../hooks/usePlayersDatabaseReadStoreEntry.js'
import {
  buildClubIntelligenceFromMaster,
  enrichClubIntelligenceFromClubDocument,
} from '../../../../domain/clubIntelligence/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export default function useClubPage({ clubId } = {}) {
  const normalizedClubId = clean(clubId)
  const clubCacheKey = useMemo(
    () => buildClubDocumentCacheKey(normalizedClubId),
    [normalizedClubId]
  )
  const clubsMasterCacheKey = useMemo(
    () => buildClubsMasterCacheKey(),
    []
  )
  const clubStoreEntry = usePlayersDatabaseReadStoreEntry(clubCacheKey)
  const masterStoreEntry = usePlayersDatabaseReadStoreEntry(clubsMasterCacheKey)
  const clubsMasterDoc = useMemo(() => ({
    masterDocument: masterStoreEntry.data,
    clubDocument: clubStoreEntry.data,
  }), [clubStoreEntry.data, masterStoreEntry.data])
  const loading = (
    masterStoreEntry.status === 'idle' ||
    masterStoreEntry.status === 'loading' ||
    clubStoreEntry.status === 'idle' ||
    clubStoreEntry.status === 'loading'
  )
  const refreshing = (
    masterStoreEntry.status === 'refreshing' ||
    clubStoreEntry.status === 'refreshing'
  )
  const refreshError = (
    masterStoreEntry.refreshError?.message ||
    clubStoreEntry.refreshError?.message ||
    ''
  )
  const entryError = masterStoreEntry.status === 'error'
    ? masterStoreEntry.error
    : clubStoreEntry.status === 'error'
      ? clubStoreEntry.error
      : null
  const error = entryError?.message || ''

  const reload = useCallback(async () => {
    const [masterDocument] = await Promise.all([
      readClubsMasterDocument(),
      readClubPageDocument({
        clubId: normalizedClubId,
        refresh: true,
      }),
    ])
    return masterDocument
  }, [normalizedClubId])

  useEffect(() => {
    Promise.all([
      readClubsMasterDocument(),
      readClubPageDocument({ clubId: normalizedClubId }),
    ]).catch(() => {})
  }, [normalizedClubId])

  const clubMasterEntry = useMemo(() => (
    (Array.isArray(clubsMasterDoc?.masterDocument?.clubs) ? clubsMasterDoc.masterDocument.clubs : [])
      .find(item => clean(item?.clubId) === normalizedClubId) || null
  ), [clubsMasterDoc, normalizedClubId])
  const intelligence = useMemo(() => {
    if (!clubMasterEntry) return null

    const base = buildClubIntelligenceFromMaster({ club: clubMasterEntry })
    return clubsMasterDoc?.clubDocument
      ? enrichClubIntelligenceFromClubDocument({
          intelligence: base,
          clubDocument: clubsMasterDoc.clubDocument,
        })
      : base
  }, [clubMasterEntry, clubsMasterDoc])
  const club = intelligence?.club || clubMasterEntry || null
  const page = useMemo(() => buildClubPageModel({ intelligence }), [intelligence])

  return {
    club,
    reload,
    intelligence,
    page,
    loading,
    refreshing,
    error,
    refreshError,
    notFound: Boolean(
      masterStoreEntry.status === 'ready' &&
      clubStoreEntry.status === 'ready' &&
      !club
    ),
  }
}
