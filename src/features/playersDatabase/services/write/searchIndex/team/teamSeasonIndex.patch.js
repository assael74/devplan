// features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.patch.js

import { collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where, writeBatch } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { normalizeTeamIdentity } from '../../../../model/teamIdentity.model.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../../leagues/leagueDoc.js'
import { buildTeamSeasonIndexId, resolveClubLevel } from './teamSeasonIndex.model.js'
import { buildSearchIndexWriteResult, SEARCH_INDEX_ENTITY_TYPES } from '../shared/searchIndexResult.model.js'

export async function updateTeamSeasonSearchIndexRosterMeta({
  league = {},
  season = {},
  team = {},
  target = 'current',
  playersCount = 0,
  playerSeasonIndexCount = 0,
  scoutProfiledPlayersCount = 0,
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const rawSeasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(rawSeasonId)
  const seasonId = rawSeasonId || seasonKey
  const teamIdentity = normalizeTeamIdentity({ team })
  const teamId = clean(teamIdentity.birthTeamId || teamIdentity.teamId)
  const clubId = clean(team.clubId)
  const id = buildTeamSeasonIndexId({ leagueId, seasonKey, teamId, clubId })
  if (!id) throw new Error('Missing team season index id')

  const batch = writeBatch(db)
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
      clubLevel: resolveClubLevel({ clubId, clubLevel: team.clubLevel }),
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
      playerSeasonIndexCount: toNumberOrZero(playerSeasonIndexCount),
      scoutProfiledPlayersCount: toNumberOrZero(scoutProfiledPlayersCount),
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
  const seasonId = clean(season.seasonId)
  const birthTeamId = clean(team.birthTeamId || team.teamId)
  const teamUrl = clean(team.teamUrl)
  const requestedEntityId = clean(
    team.entityId ||
    team.searchIndexId ||
    team.indexId
  )

  if (!seasonId) throw new Error('Missing season id')
  if (!birthTeamId) throw new Error('Missing birth team id')

  const expectedEntityId = requestedEntityId || buildTeamSeasonIndexId({
    leagueId,
    seasonKey: seasonId,
    teamId: birthTeamId,
    clubId: clean(team.clubId),
  })

  if (expectedEntityId) {
    const directRef = doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      expectedEntityId
    )
    const directSnapshot = await getDoc(directRef)

    if (directSnapshot.exists()) {
      const data = directSnapshot.data() || {}
      const isMatchingIndex = (
        clean(data.entityType) === 'birthTeamSeason' &&
        clean(data.entityId || directSnapshot.id) === expectedEntityId &&
        clean(data.seasonId) === seasonId &&
        clean(data.birthTeamId || data.teamId) === birthTeamId
      )

      if (isMatchingIndex) {
        await updateDoc(directRef, {
          teamUrl,
          updatedAt: serverTimestamp(),
        })

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

  const indexQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('entityType', '==', 'birthTeamSeason'),
    where('seasonId', '==', seasonId),
    where('birthTeamId', '==', birthTeamId)
  )
  const querySnapshot = await getDocs(indexQuery)
  const matchingDoc = querySnapshot.docs.find(snapshot => {
    const data = snapshot.data() || {}
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

  await updateDoc(matchingDoc.ref, {
    teamUrl,
    updatedAt: serverTimestamp(),
  })

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
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamIdentity = normalizeTeamIdentity({ team })
  const teamId = clean(teamIdentity.birthTeamId || teamIdentity.teamId)
  const clubId = clean(team.clubId)
  const id = buildTeamSeasonIndexId({ leagueId, seasonKey, teamId, clubId })
  if (!id) throw new Error('Missing team season index id')

  const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, id)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) {
    return buildSearchIndexWriteResult({
      entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
      operation: 'updateScoutProfilesSummary',
      rowsCount: 0,
      id,
      updated: false,
      reason: 'teamSeasonIndexMissing',
    })
  }

  await updateDoc(ref, {
    scoutProfiledPlayersCount: toNumberOrZero(scoutProfilesSummary.total),
    scoutProfilesSummary: {
      total: toNumberOrZero(scoutProfilesSummary.total),
      profileCounts: scoutProfilesSummary.profileCounts || {},
    },
    sourceTarget: clean(target) === 'history' ? 'history' : 'current',
    updatedAt: serverTimestamp(),
  })

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
    operation: 'updateScoutProfilesSummary',
    rowsCount: 1,
    id,
    updated: true,
    scoutProfiledPlayersCount: toNumberOrZero(scoutProfilesSummary.total),
  })
}
