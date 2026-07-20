// features/playersDatabase/services/write/searchIndex/searchIndexDelete.js

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../leagues/leagueDoc.js'
import { buildTeamSeasonIndexId } from './teamSeasonIndex.js'

const normalizeText = value =>
  clean(value).toLowerCase()

const getPlayerMergeKey = player =>
  clean(player?.externalPlayerId || player?.normalizedName || player?.fullName || player?.playerId).toLowerCase()

const dataMatchesPlayer = (data = {}, player = {}) => {
  const playerKey = getPlayerMergeKey(player)
  if (!playerKey) return false

  const dataKey = getPlayerMergeKey({
    externalPlayerId: data.externalPlayerId,
    normalizedName: data.normalizedDisplayName,
    fullName: data.displayName,
    playerId: data.playerId,
  })

  return dataKey === playerKey || normalizeText(data.displayName) === playerKey
}

const collectIndexMeta = snapshot => {
  const playerDocumentIds = []
  const teamDocumentIds = []

  snapshot.docs.forEach(indexDoc => {
    const data = indexDoc.data() || {}
    const playerDocumentId = clean(data.playerDocumentId || (clean(data.sourceCollection) === 'players' ? data.sourceDocumentId : ''))
    const teamDocumentId = clean(data.teamDocumentId || (['teams', 'birthTeams'].includes(clean(data.sourceCollection)) ? data.sourceDocumentId : ''))

    if (playerDocumentId) playerDocumentIds.push(playerDocumentId)
    if (teamDocumentId) teamDocumentIds.push(teamDocumentId)
  })

  return {
    playerDocumentIds: [...new Set(playerDocumentIds)],
    teamDocumentIds: [...new Set(teamDocumentIds)],
  }
}

const deleteSnapshotDocs = async snapshot => {
  const batch = writeBatch(db)

  snapshot.docs.forEach(indexDoc => {
    batch.delete(indexDoc.ref)
  })

  if (snapshot.docs.length) {
    await batch.commit()
  }

  return snapshot.docs.length
}

export async function deleteSearchIndexesForLeagueSeason({
  league = {},
  season = {},
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonKey) throw new Error('Missing season key')

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('leagueId', '==', leagueId),
    where('seasonKey', '==', seasonKey)
  )
  const snapshot = await getDocs(rowsQuery)
  const meta = collectIndexMeta(snapshot)
  const rowsCount = await deleteSnapshotDocs(snapshot)

  return {
    rowsCount,
    ...meta,
  }
}

export async function deleteSearchIndexesForTeamSeason({
  league = {},
  season = {},
  team = {},
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamId = clean(team.birthTeamId || team.teamId)
  const birthTeamSlot = toNumberOrZero(team.birthTeamSlot || team.teamSlot) || 1
  const clubId = clean(team.clubId)
  if (!seasonKey) throw new Error('Missing season key')
  if (!teamId) throw new Error('Missing birth team id')

  const playerRowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('entityType', '==', 'playerSeason'),
    where('seasonKey', '==', seasonKey),
    where('teamId', '==', teamId)
  )
  const playerSnapshot = await getDocs(playerRowsQuery)
  const matchingPlayerDocs = {
    docs: playerSnapshot.docs.filter(indexDoc => {
      const data = indexDoc.data() || {}
      if (birthTeamSlot && toNumberOrZero(data.birthTeamSlot) !== birthTeamSlot) return false
      if (leagueId && clean(data.leagueId) && clean(data.leagueId) !== leagueId) return false

      return true
    }),
  }
  const meta = collectIndexMeta(matchingPlayerDocs)
  const playerRowsCount = await deleteSnapshotDocs(matchingPlayerDocs)
  const teamSeasonIndexId = buildTeamSeasonIndexId({ leagueId, seasonKey, teamId, clubId })
  let teamRowsCount = 0

  if (teamSeasonIndexId) {
    await deleteDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, teamSeasonIndexId))
    teamRowsCount = 1
  }

  return {
    rowsCount: playerRowsCount + teamRowsCount,
    playerRowsCount,
    teamRowsCount,
    ...meta,
  }
}

export async function deleteSearchIndexForTeamPlayerSeason({
  season = {},
  team = {},
  player = {},
} = {}) {
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamId = clean(team.birthTeamId || team.teamId)
  const leagueId = clean(season.leagueId || team.leagueId)
  const birthTeamSlot = toNumberOrZero(team.birthTeamSlot || team.teamSlot) || 1
  if (!seasonKey) throw new Error('Missing season key')
  if (!teamId) throw new Error('Missing birth team id')

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('entityType', '==', 'playerSeason'),
    where('seasonKey', '==', seasonKey),
    where('teamId', '==', teamId)
  )
  const snapshot = await getDocs(rowsQuery)
  const matchingDocs = {
    docs: snapshot.docs.filter(indexDoc => {
      const data = indexDoc.data() || {}
      if (birthTeamSlot && toNumberOrZero(data.birthTeamSlot) !== birthTeamSlot) return false
      if (leagueId && clean(data.leagueId) && clean(data.leagueId) !== leagueId) return false

      return dataMatchesPlayer(data, player)
    }),
  }
  const meta = collectIndexMeta(matchingDocs)
  const rowsCount = await deleteSnapshotDocs(matchingDocs)
  const remainingSnapshot = await getDocs(rowsQuery)

  const remainingRowsCount = remainingSnapshot.docs.filter(indexDoc => {
    const data = indexDoc.data() || {}
    if (birthTeamSlot && toNumberOrZero(data.birthTeamSlot) !== birthTeamSlot) return false
    if (leagueId && clean(data.leagueId) && clean(data.leagueId) !== leagueId) return false

    return true
  }).length

  return {
    rowsCount,
    remainingRowsCount,
    ...meta,
  }
}




