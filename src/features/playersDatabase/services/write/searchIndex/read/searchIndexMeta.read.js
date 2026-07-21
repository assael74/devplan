// features/playersDatabase/services/write/searchIndex/read/searchIndexMeta.read.js

import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { buildPlayerMatchValues, normalizePlayerNameValue } from '../../../../model/playerIdentity.model.js'
import { normalizeSeasonIdentity } from '../../../../model/season.model.js'
import { normalizeTeamIdentity } from '../../../../model/teamIdentity.model.js'
import { clean, toNumberOrZero } from '../../leagues/leagueDoc.js'
import { buildSearchIndexMetaResult } from '../shared/searchIndexResult.model.js'

export const normalizeText = value =>
  clean(value).toLowerCase()

export const getPlayerMergeKey = player => {
  const matchValue = buildPlayerMatchValues(player)[0] || ''

  return normalizePlayerNameValue(matchValue)
}

export const dataMatchesPlayer = (data = {}, player = {}) => {
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

export const collectIndexMeta = snapshot => {
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

export async function getSearchIndexMetaForTeamSeason({
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

  return buildSearchIndexMetaResult({
    rowsCount: matchingPlayerDocs.docs.length,
    ...collectIndexMeta(matchingPlayerDocs),
  })
}

export async function getSearchIndexMetaForTeamPlayerSeason({
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

  return buildSearchIndexMetaResult({
    rowsCount: matchingDocs.docs.length,
    ...collectIndexMeta(matchingDocs),
  })
}

