// src/features/playersDatabase/services/read/pages/teamPage.read.js

import { getLeagueById } from '../entities/league.js'
import { getTeamById } from '../entities/team.js'
import {
  getTeamSeasonByDocumentId,
  teamSeasonDocRefById,
} from '../entities/teamSeason.js'
import {
  doc,
  onSnapshot,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  trackFirestoreListenerClose,
  trackFirestoreListenerOpen,
  trackFirestoreListenerUpdate,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../../domain/identity/index.js'
import { resolveTeamBirthYear } from '../../../model/team/teamIdentity.model.js'
import { buildTeamPageSeasonSnapshots } from '../../../model/team/page/teamPageSeasonSnapshots.model.js'
import { buildTeamPageData } from '../../../model/team/page/teamPageData.model.js'
import {
  buildTeamPageDataCacheKey,
  buildLeagueDocumentCacheKey,
  buildTeamDocumentCacheKey,
  buildTeamSeasonDocumentCacheKey,
  readWithDocumentCache,
  refreshWithDocumentCache,
  setDocumentCacheValue,
} from '../../cache/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const getSeasonId = season => clean(
  season?.identity?.seasonId || season?.seasonId
)

const getSeasonLeagueId = season => clean(
  season?.identity?.leagueId || season?.leagueId
)

const getSeasonRefs = teamDoc => Object.entries(
  teamDoc?.seasonRefsById && typeof teamDoc.seasonRefsById === 'object'
    ? teamDoc.seasonRefsById
    : {}
).map(([seasonId, ref]) => ({
  seasonId: clean(seasonId),
  teamSeasonDocumentId: clean(ref?.teamSeasonDocumentId),
  leagueId: clean(ref?.leagueId),
}))

const loadTeamPageData = async ({ leagueId = '', teamId = '' } = {}) => {
  const [leagueDoc, teamDoc] = await Promise.all([
    getLeagueById(leagueId),
    getTeamById(teamId),
  ])

  const seasonRefs = getSeasonRefs(teamDoc)
  const teamSeasons = (await Promise.all(
    seasonRefs.map(ref => {
      const canonicalDocumentId = buildTeamSeasonDocumentId({
        teamId,
        seasonId: ref.seasonId,
      })

      if (ref.teamSeasonDocumentId && ref.teamSeasonDocumentId !== canonicalDocumentId) {
        throw new Error('Invalid teamSeasonDocumentId reference')
      }

      return getTeamSeasonByDocumentId(canonicalDocumentId)
    })
  )).filter(Boolean)
  const birthYear = resolveTeamBirthYear({ teamId, team: teamDoc })
  const relatedLeagueIds = new Set([
    clean(leagueId),
    ...seasonRefs.map(ref => ref.leagueId),
    ...teamSeasons.map(getSeasonLeagueId),
  ].filter(Boolean))
  const relatedLeagueResults = await Promise.all(
    [...relatedLeagueIds].map(async id => ({
      leagueId: id,
      document: await getLeagueById(id),
    }))
  )
  const leagueDocuments = relatedLeagueResults
    .map(result => result.document)
    .filter(Boolean)
  const seasonSnapshots = buildTeamPageSeasonSnapshots({
    teamId,
    teamSeasons,
    leagueDocuments,
  })
  const teamPageData = buildTeamPageData({
    teamId,
    teamDocument: teamDoc,
    seasonSnapshots,
  })
  const teamSeasonsById = new Map(
    teamSeasons
      .map(season => [getSeasonId(season), season])
      .filter(([seasonId]) => Boolean(seasonId))
  )

  return {
    leagueDoc,
    teamDoc,
    teamSeasons,
    seasonSnapshots,
    teamPageData,
    leagueDocuments,
    documentLoadState: {
      leagueDocuments: relatedLeagueResults.map(result => ({
        leagueId: result.leagueId,
        documentExists: Boolean(result.document),
        document: result.document || null,
      })),
      teamRoot: {
        teamId: clean(teamId),
        birthYear,
        documentExists: Boolean(teamDoc),
        document: teamDoc || null,
      },
      teamSeasons: seasonRefs.map(ref => ({
        seasonId: ref.seasonId,
        leagueId: ref.leagueId,
        teamSeasonDocumentId: ref.teamSeasonDocumentId,
        documentExists: teamSeasonsById.has(ref.seasonId),
        document: teamSeasonsById.get(ref.seasonId) || null,
      })),
    },
  }
}

export const readTeamPageData = async ({
  leagueId = '',
  teamId = '',
  rebuildFromCache = false,
} = {}) => {
  const key = buildTeamPageDataCacheKey({ leagueId, teamId })
  if (!key) return loadTeamPageData({ leagueId, teamId })

  const reader = rebuildFromCache ? refreshWithDocumentCache : readWithDocumentCache
  return reader({
    key,
    read: () => loadTeamPageData({ leagueId, teamId }),
  })
}

const subscribeCachedDocument = ({
  reference,
  collectionName,
  documentId,
  cacheKey,
  action,
  onValue,
  onError,
}) => {
  const listenerId = `players-database-${action}-${documentId}-${Date.now()}`
  const usage = {
    collection: collectionName,
    shortKey: documentId,
    feature: 'playersDatabase',
    action,
    listenerId,
  }

  trackFirestoreListenerOpen(usage)
  const unsubscribe = onSnapshot(
    reference,
    snapshot => {
      const value = snapshot.exists()
        ? { id: snapshot.id, ...snapshot.data() }
        : null
      trackFirestoreListenerUpdate({
        ...usage,
        docs: value ? [value] : [],
        docsCount: value ? 1 : 0,
        readsCount: value ? 1 : 0,
        fromCache: snapshot.metadata.fromCache,
      })
      setDocumentCacheValue({ key: cacheKey, value })
      onValue(value)
    },
    error => {
      trackFirestoreListenerUpdate({
        ...usage,
        docsCount: 0,
        readsCount: 0,
        status: 'error',
        errorCode: error && error.code ? error.code : 'unknown',
      })
      if (typeof onError === 'function') onError(error)
    }
  )

  return () => {
    unsubscribe()
    trackFirestoreListenerClose(usage)
  }
}

export const subscribeTeamPageData = ({
  leagueId = '',
  teamId = '',
  onError,
} = {}) => {
  const safeLeagueId = clean(leagueId)
  const safeTeamId = clean(teamId)
  if (!safeLeagueId || !safeTeamId) return () => {}

  let active = true
  let teamLoaded = false
  let teamDocument = null
  let publishRevision = 0
  const seasonListeners = new Map()
  const seasonDocuments = new Map()
  const leagueListeners = new Map()

  const allLoaded = listeners => (
    [...listeners.values()].every(listener => listener.loaded)
  )

  const publish = () => {
    if (!active || !teamLoaded || !allLoaded(seasonListeners) || !allLoaded(leagueListeners)) return
    publishRevision += 1
    const revision = publishRevision
    readTeamPageData({
      leagueId: safeLeagueId,
      teamId: safeTeamId,
      rebuildFromCache: true,
    }).catch(error => {
      if (!active || revision !== publishRevision) return
      if (typeof onError === 'function') onError(error)
    })
  }

  const reconcileLeagueListeners = () => {
    const requiredLeagueIds = new Set([
      safeLeagueId,
      ...getSeasonRefs(teamDocument).map(ref => ref.leagueId),
      ...[...seasonDocuments.values()].filter(Boolean).map(getSeasonLeagueId),
    ].map(clean).filter(Boolean))

    leagueListeners.forEach((listener, id) => {
      if (requiredLeagueIds.has(id)) return
      listener.unsubscribe()
      leagueListeners.delete(id)
    })

    requiredLeagueIds.forEach(id => {
      if (leagueListeners.has(id)) return
      const listener = { loaded: false, unsubscribe: () => {} }
      listener.unsubscribe = subscribeCachedDocument({
        reference: doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, id),
        collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues,
        documentId: id,
        cacheKey: buildLeagueDocumentCacheKey(id),
        action: 'team-page-league-live',
        onError,
        onValue: () => {
          listener.loaded = true
          publish()
        },
      })
      leagueListeners.set(id, listener)
    })
  }

  const reconcileSeasonListeners = () => {
    const requiredDocuments = new Map(getSeasonRefs(teamDocument).map(ref => {
      const documentId = buildTeamSeasonDocumentId({
        teamId: safeTeamId,
        seasonId: ref.seasonId,
      })
      if (ref.teamSeasonDocumentId && ref.teamSeasonDocumentId !== documentId) {
        throw new Error('Invalid teamSeasonDocumentId reference')
      }
      return [documentId, ref]
    }))

    seasonListeners.forEach((listener, documentId) => {
      if (requiredDocuments.has(documentId)) return
      listener.unsubscribe()
      seasonListeners.delete(documentId)
      seasonDocuments.delete(documentId)
    })

    requiredDocuments.forEach((_ref, documentId) => {
      if (seasonListeners.has(documentId)) return
      const listener = { loaded: false, unsubscribe: () => {} }
      listener.unsubscribe = subscribeCachedDocument({
        reference: teamSeasonDocRefById(documentId),
        collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
        documentId,
        cacheKey: buildTeamSeasonDocumentCacheKey(documentId),
        action: 'team-page-team-season-live',
        onError,
        onValue: value => {
          listener.loaded = true
          seasonDocuments.set(documentId, value)
          reconcileLeagueListeners()
          publish()
        },
      })
      seasonListeners.set(documentId, listener)
    })

    reconcileLeagueListeners()
    publish()
  }

  reconcileLeagueListeners()
  const unsubscribeTeam = subscribeCachedDocument({
    reference: doc(db, PLAYERS_DATABASE_COLLECTIONS.teamRoots, safeTeamId),
    collectionName: PLAYERS_DATABASE_COLLECTIONS.teamRoots,
    documentId: safeTeamId,
    cacheKey: buildTeamDocumentCacheKey(safeTeamId),
    action: 'team-page-team-root-live',
    onError,
    onValue: value => {
      teamLoaded = true
      teamDocument = value
      try {
        reconcileSeasonListeners()
      } catch (error) {
        if (typeof onError === 'function') onError(error)
      }
    },
  })

  return () => {
    active = false
    unsubscribeTeam()
    seasonListeners.forEach(listener => listener.unsubscribe())
    leagueListeners.forEach(listener => listener.unsubscribe())
    seasonListeners.clear()
    leagueListeners.clear()
  }
}
