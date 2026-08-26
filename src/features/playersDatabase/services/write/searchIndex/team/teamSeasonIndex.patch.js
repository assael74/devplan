// features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.patch.js

import {
  collection,
  doc,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import {
  createTrackedWriteBatch,
  trackedGetDoc,
  trackedGetDocs,
  trackedUpdateDoc,
} from '../../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
} from '../../../../model/season.model.js'
import { normalizeTeamIdentity } from '../../../../model/teamIdentity.model.js'
import {
  buildSeasonKey,
  clean,
  toNumberOrZero,
} from '../../leagues/leagueDoc.js'
import {
  buildTeamSeasonIndexId,
  resolveClubLevel,
  resolveClubStrengthLevel,
} from './teamSeasonIndex.model.js'
import { buildTeamBalanceSearchIndexProjection } from './teamSeasonIndex.balance.js'
import {
  buildSearchIndexWriteResult,
  SEARCH_INDEX_ENTITY_TYPES,
} from '../shared/searchIndexResult.model.js'

const readSearchIndexes = queryRef => {
  return trackedGetDocs(queryRef, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'teamSeasonIndex-patch',
    operationSubtype: 'maintenance-query',
  })
}

const teamSeasonIndexUpdateUsage = {
  __firestoreUsageContext: {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'teamSeasonIndex-update',
    operationSubtype: 'maintenance-updateDoc',
  },
}

const normalizeScoutProfilesSummary = summary => {
  const profileCounts =
    summary?.profileCounts &&
    typeof summary.profileCounts === 'object'
      ? summary.profileCounts
      : {}

  return {
    total: toNumberOrZero(summary?.total),
    profileCounts: Object.keys(profileCounts)
      .sort()
      .reduce((result, profileId) => {
        result[profileId] = toNumberOrZero(profileCounts[profileId])
        return result
      }, {}),
  }
}

const areScoutProfilesSummariesEqual = (left, right) => (
  JSON.stringify(normalizeScoutProfilesSummary(left)) ===
  JSON.stringify(normalizeScoutProfilesSummary(right))
)


export async function updateTeamSeasonSearchIndexRosterMeta({
  league = {},
  season = {},
  team = {},
  target = 'current',
  playersCount = 0,
  playerSeasonIndexCount = 0,
  scoutProfilesSummary = null,
  teamBalance = null,
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const rawSeasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(rawSeasonId)
  const seasonId = rawSeasonId || seasonKey
  const teamIdentity = normalizeTeamIdentity({ team })
  const teamId = clean(teamIdentity.birthTeamId || teamIdentity.teamId)
  const clubId = clean(team.clubId)
  const id = buildTeamSeasonIndexId({
    leagueId,
    seasonKey,
    teamId,
    clubId,
  })
  if (!id) throw new Error('Missing team season index id')

  const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'teamSeasonIndex-patch',
    operationSubtype: 'maintenance-batch',
  })
  batch.set(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, id),
    {
      id,
      entityType: 'birthTeamSeason',
      entityId: id,
      leagueId,
      seasonId,
      seasonKey,
      clubId,
      clubLevel: resolveClubLevel({
        clubId,
        clubLevel: team.clubLevel,
      }),
      clubStrengthLevel: resolveClubStrengthLevel({
        clubId,
        clubLevel: team.clubLevel,
        clubStrengthLevel: team.clubStrengthLevel,
      }),
      birthTeamId: teamId,
      birthTeamDocumentId: teamIdentity.birthTeamDocumentId || teamId,
      birthTeamSlot: toNumberOrZero(team.birthTeamSlot || team.teamSlot) || 1,
      teamId,
      teamDocumentId: teamIdentity.birthTeamDocumentId || teamIdentity.teamDocumentId || teamId,
      teamUrl: clean(team.teamUrl),
      seasonUrl: clean(season.seasonUrl),
      birthYear: toNumberOrZero(season.birthYear),
      leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
      playersCount: toNumberOrZero(playersCount),
      ...(scoutProfilesSummary !== null && scoutProfilesSummary !== undefined
        ? { scoutProfilesSummary: normalizeScoutProfilesSummary(scoutProfilesSummary) }
        : {}),
      ...buildTeamBalanceSearchIndexProjection(teamBalance),
      sourceTarget: clean(target) === 'history' ? 'history' : 'current',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  await batch.commit()

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
    operation: 'updateRosterMeta',
    rowsCount: 1,
    id,
    playersCount: toNumberOrZero(playersCount),
    playerSeasonIndexCount: toNumberOrZero(playerSeasonIndexCount),
  })
}

export async function updateTeamSeasonSearchIndexTeamUrl({
  league = {},
  season = {},
  team = {},
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonIdentity = normalizeSeasonIdentity({ season })
  const seasonId = seasonIdentity.seasonId
  const seasonKey = seasonIdentity.seasonKey
  const birthTeamId = clean(team.birthTeamId || team.teamId)
  const teamUrl = clean(team.teamUrl)
  const requestedEntityId = clean(
    team.entityId ||
    team.searchIndexId ||
    team.indexId
  )

  if (!seasonId && !seasonKey) throw new Error('Missing season id')
  if (!birthTeamId) throw new Error('Missing birth team id')

  const expectedEntityId = requestedEntityId || buildTeamSeasonIndexId({
    leagueId,
    seasonKey,
    teamId: birthTeamId,
    clubId: clean(team.clubId),
  })

  if (expectedEntityId) {
    const directRef = doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      expectedEntityId
    )
    const directSnapshot = await trackedGetDoc(directRef, {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      action: 'teamSeasonIndex-read',
      operationSubtype: 'maintenance-getDoc',
    })

    if (directSnapshot.exists()) {
      const data = directSnapshot.data() || {}
      const isMatchingIndex = (
        clean(data.entityType) === 'birthTeamSeason' &&
        clean(data.entityId || directSnapshot.id) === expectedEntityId &&
        clean(data.seasonId) === seasonId &&
        clean(data.birthTeamId || data.teamId) === birthTeamId
      )

      if (isMatchingIndex) {
        if (clean(data.teamUrl) === teamUrl) {
          return buildSearchIndexWriteResult({
            entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
            operation: 'updateTeamUrl',
            rowsCount: 0,
            id: directSnapshot.id,
            teamUrl,
            updated: true,
            changed: false,
            writeSkipped: true,
          })
        }

        await trackedUpdateDoc(directRef, {
          teamUrl,
          updatedAt: serverTimestamp(),
        }, teamSeasonIndexUpdateUsage)

        return buildSearchIndexWriteResult({
          entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
          operation: 'updateTeamUrl',
          rowsCount: 1,
          id: directSnapshot.id,
          teamUrl,
          updated: true,
        })
      }
    }
  }

  const fallbackConstraints = [
    where('entityType', '==', 'birthTeamSeason'),
    where('birthTeamId', '==', birthTeamId),
  ]
  if (seasonKey) {
    fallbackConstraints.push(
      where('seasonKey', '==', seasonKey)
    )
  }

  const indexQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    ...fallbackConstraints
  )
  const querySnapshot = await readSearchIndexes(indexQuery)
  const matchingDoc = querySnapshot.docs.find(snapshot => {
    const data = snapshot.data() || {}
    if (!isSameSeason(data, {
      seasonId,
      seasonKey,
    })) return false
    if (!requestedEntityId) return true

    return clean(data.entityId || snapshot.id) === requestedEntityId
  })

  if (!matchingDoc) {
    return buildSearchIndexWriteResult({
      entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
      operation: 'updateTeamUrl',
      rowsCount: 0,
      id: expectedEntityId,
      teamUrl,
      updated: false,
      reason: 'teamSeasonIndexMissing',
    })
  }

  const matchingData = matchingDoc.data() || {}
  if (clean(matchingData.teamUrl) === teamUrl) {
    return buildSearchIndexWriteResult({
      entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
      operation: 'updateTeamUrl',
      rowsCount: 0,
      id: matchingDoc.id,
      teamUrl,
      updated: true,
      changed: false,
      writeSkipped: true,
    })
  }

  await trackedUpdateDoc(matchingDoc.ref, {
    teamUrl,
    updatedAt: serverTimestamp(),
  }, teamSeasonIndexUpdateUsage)

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
    operation: 'updateTeamUrl',
    rowsCount: 1,
    id: matchingDoc.id,
    teamUrl,
    updated: true,
  })
}

export async function updateTeamSeasonSearchIndexScoutProfilesSummary({
  league = {},
  season = {},
  team = {},
  target = 'current',
  scoutProfilesSummary = {},
  teamBalance = null,
  playersCount = null,
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamIdentity = normalizeTeamIdentity({ team })
  const teamId = clean(teamIdentity.birthTeamId || teamIdentity.teamId)
  const clubId = clean(team.clubId)
  const id = buildTeamSeasonIndexId({
    leagueId,
    seasonKey,
    teamId,
    clubId,
  })
  if (!id) throw new Error('Missing team season index id')

  const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, id)
  const snapshot = await trackedGetDoc(ref, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'teamSeasonIndex-read',
    operationSubtype: 'maintenance-getDoc',
  })
  const normalizedSummary = normalizeScoutProfilesSummary(scoutProfilesSummary)
  const balanceProjection = buildTeamBalanceSearchIndexProjection(teamBalance)

  if (!snapshot.exists()) {
    const batch = createTrackedWriteBatch(db, {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      action: 'teamSeasonIndex-patch',
      operationSubtype: 'maintenance-batch',
    })
    batch.set(
      ref,
      {
        id,
        entityType: 'birthTeamSeason',
        entityId: id,
        leagueId,
        seasonId,
        seasonKey,
        clubId,
        clubLevel: resolveClubLevel({
          clubId,
          clubLevel: team.clubLevel,
        }),
        clubStrengthLevel: resolveClubStrengthLevel({
          clubId,
          clubLevel: team.clubLevel,
          clubStrengthLevel: team.clubStrengthLevel,
        }),
        birthTeamId: teamId,
        birthTeamDocumentId: teamIdentity.birthTeamDocumentId || teamId,
        birthTeamSlot: toNumberOrZero(team.birthTeamSlot || team.teamSlot) || 1,
        teamId,
        teamDocumentId:
          teamIdentity.birthTeamDocumentId ||
          teamIdentity.teamDocumentId ||
          teamId,
        teamUrl: clean(team.teamUrl),
        seasonUrl: clean(season.seasonUrl),
        birthYear: toNumberOrZero(season.birthYear),
        leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
        ...(playersCount !== null && playersCount !== undefined
          ? { playersCount: toNumberOrZero(playersCount) }
          : {}),
        scoutProfilesSummary: normalizedSummary,
        ...balanceProjection,
        sourceTarget: clean(target) === 'history' ? 'history' : 'current',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
    await batch.commit()

    return buildSearchIndexWriteResult({
      entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
      operation: 'updateScoutProfilesSummary',
      rowsCount: 1,
      id,
      updated: true,
      created: true,
      ...(playersCount !== null && playersCount !== undefined
        ? { playersCount: toNumberOrZero(playersCount) }
        : {}),
      scoutProfiledPlayersCount: toNumberOrZero(scoutProfilesSummary.total),
    })
  }

  const existingData = snapshot.data() || {}

  const existingBalanceProjection = Object.keys(balanceProjection).reduce((result, key) => ({
    ...result,
    [key]: existingData[key] ?? '',
  }), {})
  const hasPlayersCount = playersCount !== null && playersCount !== undefined
  const normalizedPlayersCount = hasPlayersCount
    ? toNumberOrZero(playersCount)
    : null
  const playersCountUnchanged = !hasPlayersCount || (
    toNumberOrZero(existingData.playersCount) === normalizedPlayersCount
  )

  if (
    playersCountUnchanged &&
    areScoutProfilesSummariesEqual(
      existingData.scoutProfilesSummary,
      normalizedSummary
    ) &&
    JSON.stringify(existingBalanceProjection) === JSON.stringify(balanceProjection)
  ) {
    return buildSearchIndexWriteResult({
      entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
      operation: 'updateScoutProfilesSummary',
      rowsCount: 0,
      id,
      updated: true,
      changed: false,
      writeSkipped: true,
    })
  }

  await trackedUpdateDoc(ref, {
    ...(hasPlayersCount
      ? { playersCount: normalizedPlayersCount }
      : {}),
    scoutProfilesSummary: normalizedSummary,
    ...balanceProjection,
    sourceTarget: clean(target) === 'history' ? 'history' : 'current',
    updatedAt: serverTimestamp(),
  }, teamSeasonIndexUpdateUsage)

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
    operation: 'updateScoutProfilesSummary',
    rowsCount: 1,
    id,
    updated: true,
    ...(hasPlayersCount
      ? { playersCount: normalizedPlayersCount }
      : {}),
    scoutProfiledPlayersCount: toNumberOrZero(scoutProfilesSummary.total),
  })
}
