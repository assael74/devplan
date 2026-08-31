// src/features/playersDatabase/services/read/playerSearchIndexExport.read.js

import {
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import {
  trackedGetDoc,
  trackedGetDocs,
} from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { buildPlayerSeasonIndexId } from '../write/searchIndex/player/playerSeasonIndex.identity.js'
import { buildTeamSeasonIndexId } from '../write/searchIndex/team/teamSeasonIndex.model.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const readSearchIndexDocument = async ({ documentId = '', action = '' } = {}) => {
  const safeDocumentId = clean(documentId)
  if (!safeDocumentId) return null

  const snapshot = await trackedGetDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, safeDocumentId),
    {
      feature: 'playersDatabase',
      action,
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      meta: { documentId: safeDocumentId },
    }
  )

  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : null
}

const readSearchIndexFallback = async ({
  entityType = '',
  birthTeamId = '',
  seasonKey = '',
  action = '',
  matches = () => false,
} = {}) => {
  const safeBirthTeamId = clean(birthTeamId)
  const safeSeasonKey = clean(seasonKey)
  if (!entityType || !safeBirthTeamId || !safeSeasonKey) return null

  const snapshot = await trackedGetDocs(
    query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
      where('entityType', '==', entityType),
      where('birthTeamId', '==', safeBirthTeamId),
      where('seasonKey', '==', safeSeasonKey),
    ),
    {
      feature: 'playersDatabase',
      action,
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      meta: {
        entityType,
        birthTeamId: safeBirthTeamId,
        seasonKey: safeSeasonKey,
      },
    }
  )

  const matched = snapshot.docs.find(item => matches({
    id: item.id,
    ...item.data(),
  }))

  return matched
    ? { id: matched.id, ...matched.data() }
    : null
}

const resolveSeasonContext = player => {
  const activeSeason = player?.activeSeason || {}

  return {
    player: {
      playerDocumentId: clean(player?.id),
      playerId: clean(activeSeason?.identity?.playerId || player?.playerId),
      externalPlayerId: clean(
        activeSeason?.identity?.externalPlayerId || player?.externalPlayerId
      ),
      normalizedName: clean(activeSeason?.identity?.normalizedName),
      fullName: clean(activeSeason?.identity?.displayName || player?.fullName),
    },
    season: {
      seasonKey: clean(activeSeason?.season?.seasonKey || player?.seasonKey),
      seasonId: clean(activeSeason?.season?.seasonId || player?.seasonKey),
      birthYear: activeSeason?.season?.birthYear || player?.birthYear,
    },
    team: {
      leagueId: clean(activeSeason?.team?.leagueId || player?.leagueId),
      clubId: clean(activeSeason?.team?.clubId),
      teamId: clean(activeSeason?.team?.teamId || player?.teamId),
      ageGroupId: clean(activeSeason?.team?.ageGroupId),
      ageGroupLabel: clean(activeSeason?.team?.ageGroupLabel),
      birthTeamSlot: activeSeason?.team?.birthTeamSlot,
    },
  }
}

export const canReadPlayerSearchIndexExport = player => {
  const context = resolveSeasonContext(player)

  return Boolean(
    context.season.seasonKey &&
    context.team.clubId &&
    (context.player.playerId || context.player.externalPlayerId || context.player.normalizedName)
  )
}

export const canReadTeamSearchIndexExport = player => {
  const context = resolveSeasonContext(player)

  return Boolean(
    context.team.leagueId &&
    context.season.seasonKey &&
    context.team.teamId
  )
}

export const readPlayerSearchIndexExport = async ({ player = {} } = {}) => {
  const context = resolveSeasonContext(player)
  const documentId = buildPlayerSeasonIndexId({
    seasonKey: context.season.seasonKey,
    clubId: context.team.clubId,
    ageGroupId: context.team.ageGroupId,
    ageGroupLabel: context.team.ageGroupLabel,
    birthYear: context.season.birthYear,
    birthTeamSlot: context.team.birthTeamSlot,
    playerId: context.player.playerId,
    externalPlayerId: context.player.externalPlayerId,
    normalizedName: context.player.normalizedName || context.player.fullName,
  })

  const directDocument = await readSearchIndexDocument({
    documentId,
    action: 'player-search-index-json-read',
  })
  if (directDocument) return directDocument

  const playerIds = new Set([
    context.player.playerDocumentId,
    context.player.playerId,
    context.player.externalPlayerId,
  ].map(clean).filter(Boolean))
  const normalizedName = clean(
    context.player.normalizedName || context.player.fullName
  ).toLowerCase()

  return readSearchIndexFallback({
    entityType: 'playerSeason',
    birthTeamId: context.team.teamId,
    seasonKey: context.season.seasonKey,
    action: 'player-search-index-json-fallback-read',
    matches: item => {
      const indexIds = [
        item.playerDocumentId,
        item.playerId,
        item.externalPlayerId,
      ].map(clean).filter(Boolean)
      if (indexIds.some(value => playerIds.has(value))) return true

      return Boolean(
        normalizedName &&
        clean(item.normalizedDisplayName || item.displayName).toLowerCase() === normalizedName
      )
    },
  })
}

export const readTeamSearchIndexExport = async ({ player = {} } = {}) => {
  const context = resolveSeasonContext(player)
  const documentId = buildTeamSeasonIndexId({
    leagueId: context.team.leagueId,
    seasonKey: context.season.seasonKey,
    teamId: context.team.teamId,
    clubId: context.team.clubId,
  })

  const directDocument = await readSearchIndexDocument({
    documentId,
    action: 'team-search-index-json-read',
  })
  if (directDocument) return directDocument

  return readSearchIndexFallback({
    entityType: 'birthTeamSeason',
    birthTeamId: context.team.teamId,
    seasonKey: context.season.seasonKey,
    action: 'team-search-index-json-fallback-read',
    matches: () => true,
  })
}
