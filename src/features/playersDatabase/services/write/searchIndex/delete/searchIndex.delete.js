// features/playersDatabase/services/write/searchIndex/delete/searchIndex.delete.js

import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { normalizeSeasonIdentity } from '../../../../model/season.model.js'
import { normalizeTeamIdentity } from '../../../../model/teamIdentity.model.js'
import { clean, toNumberOrZero } from '../../leagues/leagueDoc.js'
import { buildTeamSeasonIndexId } from '../team/teamSeasonIndex.model.js'
import { collectIndexMeta, dataMatchesPlayer } from '../read/searchIndexMeta.read.js'
import { buildSearchIndexWriteResult } from '../shared/searchIndexResult.model.js'
import { commitBatchWhenNeeded } from '../shared/searchIndexBatch.write.js'

const deleteSnapshotDocs = async snapshot => {
  const batch = writeBatch(db)

  snapshot.docs.forEach(indexDoc => {
    batch.delete(indexDoc.ref)
  })

  await commitBatchWhenNeeded({ batch, operationsCount: snapshot.docs.length })

  return snapshot.docs.length
}

export async function deleteSearchIndexesForLeagueSeason({
  league = {},
  season = {},
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonIdentity = normalizeSeasonIdentity({ season })
  const seasonKey = seasonIdentity.seasonKey
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

  return buildSearchIndexWriteResult({
    operation: 'deleteLeagueSeason',
    rowsCount,
    ...meta,
  })
}


export async function deleteSearchIndexesForTeamSeason({
  league = {},
  season = {},
  team = {},
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonIdentity = normalizeSeasonIdentity({ season })
  const seasonKey = seasonIdentity.seasonKey
  const teamIdentity = normalizeTeamIdentity({ team })
  const teamId = clean(teamIdentity.birthTeamId || teamIdentity.teamId)
  const birthTeamSlot = teamIdentity.birthTeamSlot || 1
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

  return buildSearchIndexWriteResult({
    operation: 'deleteTeamSeason',
    rowsCount: playerRowsCount + teamRowsCount,
    playerRowsCount,
    teamRowsCount,
    ...meta,
  })
}

export async function deleteSearchIndexForTeamPlayerSeason({
  season = {},
  team = {},
  player = {},
} = {}) {
  const seasonIdentity = normalizeSeasonIdentity({ season })
  const seasonKey = seasonIdentity.seasonKey
  const teamIdentity = normalizeTeamIdentity({ team })
  const teamId = clean(teamIdentity.birthTeamId || teamIdentity.teamId)
  const leagueId = clean(season.leagueId || team.leagueId)
  const birthTeamSlot = teamIdentity.birthTeamSlot || 1
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

  return buildSearchIndexWriteResult({
    operation: 'deleteTeamPlayerSeason',
    rowsCount,
    remainingRowsCount,
    ...meta,
  })
}




