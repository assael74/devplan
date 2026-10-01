// src/features/playersDatabase/services/writeV2/edits/shared/executeEdit.js

import { collection, doc, query, where } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import {
  trackedGetDocFromServer,
  trackedGetDocsFromServer,
  trackedRunTransaction,
} from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS as collections } from '../../../../constants/pdb.constants.js'
import {
  deleteDocumentCacheValue,
  invalidateDocumentCacheByPrefix,
  invalidateDocumentCacheByPrefixKeepingSnapshot,
  invalidateDocumentCacheValueKeepingSnapshot,
  updateDocumentCacheValue,
} from '../../../cache/documentCache.js'
import {
  buildClubDocumentCacheKey,
  buildClubsMasterCacheKey,
  buildLeagueDocumentCacheKey,
  buildLeaguesCollectionCacheKey,
  buildLeaguesMasterCacheKey,
  buildPlayerDocumentCacheKey,
  buildTeamDocumentCacheKey,
  buildTeamSeasonDocumentCacheKey,
  PLAYERS_DATABASE_CACHE_PREFIXES,
} from '../../../cache/cacheKeys.js'
import { equal, requireValue } from '../../../../domain/edits/editIdentity.js'

const usage = { feature: 'playersDatabase', action: 'standalone-edit' }
export const reference = (kind, id) => doc(db, collections[kind], id)
export const read = ref => trackedGetDocFromServer(ref, usage)
export const readWhere = async (kind, filters) => {
  const snapshot = await trackedGetDocsFromServer(
    query(
      collection(db, collections[kind]),
      ...Object.entries(filters).map(([field, value]) =>
        where(field, Array.isArray(value) ? 'in' : '==', value),
      ),
    ),
    usage,
  )
  return snapshot.docs
}

export const data = snapshot => {
  requireValue(snapshot?.exists(), 'מסמך מחויב חסר; לא בוצעה שמירה')
  return snapshot.data()
}

// Shared transport only: no edit action calls another edit action.
export const executeEdit = async ({ refs, build }) => {
  const updatedAt = new Date().toISOString()
  let changes
  try {
    changes = await trackedRunTransaction(
      db,
      async transaction => {
        const snapshots = new Map()
        for (const ref of new Map(refs.map(item => [item.path, item])).values()) {
          snapshots.set(ref.path, await transaction.get(ref))
        }
        const plan = build(ref => snapshots.get(ref.path), updatedAt)
        const changed = plan.filter(item =>
          Object.keys(item.patch).some(
            key => !equal(data(snapshots.get(item.ref.path))[key], item.patch[key]),
          ),
        )
        changed.forEach(item =>
          transaction.update(item.ref, {
            ...item.patch,
            updatedAt,
          }),
        )
        return changed
      },
      usage,
    )
  } catch (error) {
    // A failed commit is followed by a server refresh, never by a rollback.
    await Promise.allSettled(refs.map(read))
    invalidateEditCache(refs)
    throw error
  }
  applyCommittedEditCache(changes, updatedAt)
  return { completed: true, changedCount: changes.length }
}

const refId = ref => String(ref?.id || ref?.path?.split('/').pop() || '').trim()

const mergeCachedDocumentPatch = ({ key, patch, updatedAt }) => {
  if (!key) return
  updateDocumentCacheValue({
    key,
    updater: current => ({
      ...current,
      ...patch,
      updatedAt,
    }),
  })
}

const applyCommittedEditCache = (changes, updatedAt) => {
  if (!changes.length) return

  let invalidatesTeamPage = false
  let invalidatesLeaguesScope = false
  let invalidatesTeamsScope = false

  changes.forEach(({ ref, patch }) => {
    const kind = ref.path.split('/')[0]
    const id = refId(ref)

    if (kind === collections.leagues) {
      mergeCachedDocumentPatch({
        key: buildLeagueDocumentCacheKey(id),
        patch,
        updatedAt,
      })
      invalidatesLeaguesScope = true
      invalidatesTeamPage = true
      return
    }

    if (kind === collections.teams) {
      mergeCachedDocumentPatch({
        key: buildTeamDocumentCacheKey(id),
        patch,
        updatedAt,
      })
      invalidatesTeamsScope = true
      invalidatesTeamPage = true
      return
    }

    if (kind === collections.teamSeasons) {
      mergeCachedDocumentPatch({
        key: buildTeamSeasonDocumentCacheKey(id),
        patch,
        updatedAt,
      })
      invalidatesTeamPage = true
      return
    }

    // Player Page stores an adapted projection rather than the raw Firestore document.
    // Preserve the visible snapshot, but force the next explicit refresh/read to rebuild it.
    if (kind === collections.players) {
      invalidateDocumentCacheValueKeepingSnapshot(
        buildPlayerDocumentCacheKey(id),
      )
      return
    }

    if (kind === collections.clubs) {
      mergeCachedDocumentPatch({
        key: buildClubDocumentCacheKey(id),
        patch,
        updatedAt,
      })
      return
    }

    if (kind === collections.leaguesMaster) {
      mergeCachedDocumentPatch({
        key: buildLeaguesMasterCacheKey(),
        patch,
        updatedAt,
      })
      return
    }

    if (kind === collections.clubsMaster) {
      mergeCachedDocumentPatch({
        key: buildClubsMasterCacheKey(),
        patch,
        updatedAt,
      })
    }
  })

  if (invalidatesLeaguesScope) {
    deleteDocumentCacheValue(buildLeaguesCollectionCacheKey())
  }
  if (invalidatesTeamsScope) {
    invalidateDocumentCacheByPrefix(PLAYERS_DATABASE_CACHE_PREFIXES.teams)
  }
  if (invalidatesTeamPage) {
    invalidateDocumentCacheByPrefixKeepingSnapshot(
      PLAYERS_DATABASE_CACHE_PREFIXES.teamPage,
    )
  }
}

const invalidateEditCache = refs => {
  if (refs.length) {
    const prefixes = new Set()
    const cacheByCollection = {
      [collections.leagues]: ['league', 'leagues'],
      [collections.teams]: ['team', 'teams'],
      [collections.teamSeasons]: ['teamSeason', 'team', 'teams'],
      [collections.players]: ['player'],
      [collections.clubs]: ['club'],
      [collections.leaguesMaster]: ['leaguesMaster'],
      [collections.clubsMaster]: ['clubsMaster'],
    }
    let invalidatesTeamPage = false
    refs.forEach(ref => {
      const kind = ref.path.split('/')[0]
      ;(cacheByCollection[kind] || []).forEach(key =>
        prefixes.add(PLAYERS_DATABASE_CACHE_PREFIXES[key]),
      )
      if (
        kind === collections.leagues ||
        kind === collections.teams ||
        kind === collections.teamSeasons
      ) {
        invalidatesTeamPage = true
      }
    })
    prefixes.forEach(invalidateDocumentCacheByPrefix)
    if (invalidatesTeamPage) {
      invalidateDocumentCacheByPrefixKeepingSnapshot(
        PLAYERS_DATABASE_CACHE_PREFIXES.teamPage,
      )
    }
  }
}
