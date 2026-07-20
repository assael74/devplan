// features/playersDatabase/services/write/searchIndex/playerSeasonIndex.js

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../catalog/clubs.catalog.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../leagues/leagueDoc.js'
import { buildPlayerSeasonScope } from '../shared/playerSeasonScope.js'
import {
  buildPlayerDocumentId,
  hasPlayerScoutProfiles,
} from '../players/index.js'

const normalizeText = value =>
  clean(value).toLowerCase()

const resolveClubLevel = ({ clubId = '', clubLevel = null } = {}) => {
  const directClubLevel = Number(clubLevel)
  if (Number.isFinite(directClubLevel) && directClubLevel > 0) return directClubLevel

  const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => item.id === clean(clubId))
  return toNumberOrZero(club?.clubLevel)
}

const normalizeIdPart = value =>
  normalizeText(value).replace(/[^0-9a-zA-Z\u0590-\u05FF]+/g, '_').replace(/^_+|_+$/g, '')

const buildInternalPlayerId = ({
  player = {},
  season = {},
} = {}) => {
  const existingPlayerId = clean(player.playerId)
  if (existingPlayerId) return existingPlayerId

  const birthYear = clean(player.birthYear || season.birthYear)
  const externalPlayerId = clean(player.externalPlayerId)
  const fallbackName = normalizeIdPart(player.normalizedName || player.fullName)
  const sourceId = externalPlayerId || fallbackName

  return ['player', birthYear, sourceId]
    .map(normalizeIdPart)
    .filter(Boolean)
    .join('__')
}

const buildPlayerSeasonIndexId = ({
  seasonKey = '',
  teamId = '',
  birthTeamSlot = 1,
  externalPlayerId = '',
  normalizedName = '',
} = {}) => {
  const identityType = clean(externalPlayerId) ? 'external' : 'name'
  const identityValue = clean(externalPlayerId) || normalizeIdPart(normalizedName)

  return [
    'playerSeason',
    buildSeasonKey(seasonKey),
    normalizeIdPart(teamId),
    'slot' + (toNumberOrZero(birthTeamSlot) || 1),
    identityType,
    normalizeIdPart(identityValue),
  ].filter(Boolean).join('__')
}

const buildPlayerSeasonIndexDoc = ({
  league = {},
  season = {},
  team = {},
  target = 'current',
  player = {},
} = {}) => {
  const rawSeasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(rawSeasonId)
  const seasonId = rawSeasonId || seasonKey
  const displayName = clean(player.fullName)
  const normalizedDisplayName = normalizeText(player.normalizedName || displayName)
  const externalPlayerId = clean(player.externalPlayerId)
  const playerId = buildInternalPlayerId({ player, season })
  const teamScope = buildPlayerSeasonScope({
    season: { ...season, seasonId, seasonKey },
    team,
  })
  const teamId = teamScope.birthTeamId
  const playerDocumentId = clean(player.playerDocumentId) || (hasPlayerScoutProfiles(player)
    ? buildPlayerDocumentId(player)
    : '')
  const primaryScoutSignal = Array.isArray(player.scoutSignals) ? player.scoutSignals[0] : null
  const secondaryScoutSignal = Array.isArray(player.scoutSignals) ? player.scoutSignals[1] : null
  const id = buildPlayerSeasonIndexId({
    seasonKey,
    teamId,
    birthTeamSlot: teamScope.birthTeamSlot,
    externalPlayerId,
    normalizedName: normalizedDisplayName,
  })

  return {
    id,
    entityType: 'playerSeason',
    entityId: id,

    displayName,
    normalizedDisplayName,

    playerId,
    playerDocumentId,
    externalPlayerId,
    playerUrl: clean(player.playerUrl),
    favorite: Boolean(player.favorite),
    notes: clean(player.notes),

    leagueId: clean(league.id || teamScope.leagueId),
    seasonId,
    seasonKey,
    clubId: clean(team.clubId),
    clubLevel: resolveClubLevel({ clubId: team.clubId, clubLevel: team.clubLevel }),
    birthTeamId: teamId,
    birthTeamDocumentId: teamScope.birthTeamDocumentId,
    birthTeamSlot: teamScope.birthTeamSlot,
    teamId,
    teamDocumentId: teamScope.birthTeamDocumentId,
    teamUrl: clean(team.teamUrl),
    seasonUrl: clean(season.seasonUrl),

    ageGroupId: clean(team.ageGroupId || league.ageGroupId),
    ageGroupLabel: clean(team.ageGroupLabel || league.ageGroupLabel),
    birthYear: toNumberOrZero(season.birthYear),
    leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
    leagueLevel: toNumberOrZero(league.level),
    region: clean(league.region),

    primaryPosition: clean(player.primaryPosition),
    positionLayer: clean(player.positionLayer),
    numShirt: clean(player.numShirt),
    seasonNotes: clean(player.notes),

    teamTableRank: toNumberOrZero(team.tableRank),
    teamTableAttackRank: toNumberOrZero(team.tableAttackRank),
    teamTableDefenseRank: toNumberOrZero(team.tableDefenseRank),
    teamGoalsFor: toNumberOrZero(team.teamStats?.goalsFor ?? team.goalsFor),
    teamGoalsAgainst: toNumberOrZero(team.teamStats?.goalsAgainst ?? team.goalsAgainst),
    teamGoalsForPerGame: toNumberOrZero(team.goalsForPerGame),
    teamGamePlayed: toNumberOrZero(team.teamStats?.teamGamePlayed ?? team.teamGamePlayed),

    games: toNumberOrZero(player.playerStats?.games ?? player.games),
    goals: toNumberOrZero(player.playerStats?.goals ?? player.goals),
    yellowCards: toNumberOrZero(player.playerStats?.yellowCards ?? player.yellowCards),
    minutes: toNumberOrZero(player.playerStats?.minutes ?? player.minutes),
    starts: toNumberOrZero(player.playerStats?.starts ?? player.starts),
    substituteIn: toNumberOrZero(player.playerStats?.substituteIn ?? player.substituteIn),
    substitutedOut: toNumberOrZero(player.playerStats?.substitutedOut ?? player.substitutedOut),
    teamMinutes: 0,
    teamGames: 0,

    primaryScoutProfileId: clean(primaryScoutSignal?.profileId),
    primaryScoutReliabilityLevel: clean(primaryScoutSignal?.reliability?.level),
    primaryScoutScore: Number.isFinite(Number(primaryScoutSignal?.score)) ? Number(primaryScoutSignal.score) : null,

    secondaryScoutProfileId: clean(secondaryScoutSignal?.profileId),
    secondaryScoutReliabilityLevel: clean(secondaryScoutSignal?.reliability?.level),
    secondaryScoutScore: Number.isFinite(Number(secondaryScoutSignal?.score)) ? Number(secondaryScoutSignal.score) : null,

    sourceCollection: playerDocumentId ? 'players' : 'birthTeams',
    sourceDocumentId: playerDocumentId || teamScope.birthTeamDocumentId,
    sourceTarget: clean(target) === 'history' ? 'history' : 'current',

    updatedAt: serverTimestamp(),
  }
}

export async function upsertPlayerSeasonSearchIndexMany({
  league = {},
  season = {},
  team = {},
  target = 'current',
  players = [],
} = {}) {
  const safePlayers = (Array.isArray(players) ? players : [])
    .filter(player => clean(player.fullName))
  const batch = writeBatch(db)
  const docs = safePlayers
    .map(player => buildPlayerSeasonIndexDoc({ league, season, team, target, player }))
    .filter(row => row.id && row.teamId && row.seasonId && row.displayName)

  docs.forEach(indexDoc => {
    batch.set(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, indexDoc.id),
      indexDoc,
      { merge: true }
    )
  })

  if (docs.length) {
    await batch.commit()
  }

  return {
    entityType: 'playerSeason',
    rowsCount: docs.length,
  }
}

export async function updatePlayerSeasonSearchIndexTeamUrl({
  league = {},
  season = {},
  team = {},
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamScope = buildPlayerSeasonScope({
    season: { ...season, seasonId, seasonKey },
    team,
  })
  const teamId = teamScope.birthTeamId
  if (!seasonKey) throw new Error('Missing season key')
  if (!teamId) throw new Error('Missing birth team id')

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('teamId', '==', teamId)
  )
  const snapshot = await getDocs(rowsQuery)
  const batch = writeBatch(db)
  let updatedRowsCount = 0

  snapshot.docs.forEach(playerDoc => {
    const data = playerDoc.data() || {}
    if (clean(data.entityType) !== 'playerSeason') return
    if (clean(data.seasonKey) !== seasonKey) return
    if (leagueId && clean(data.leagueId) && clean(data.leagueId) !== leagueId) return
    if (teamScope.birthTeamSlot && toNumberOrZero(data.birthTeamSlot) !== teamScope.birthTeamSlot) return

    updatedRowsCount += 1
    batch.set(
      playerDoc.ref,
      {
        teamUrl: clean(team.teamUrl),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  if (updatedRowsCount) {
    await batch.commit()
  }

  return {
    entityType: 'playerSeason',
    rowsCount: updatedRowsCount,
    teamUrl: clean(team.teamUrl),
  }
}

export async function updatePlayerSeasonSearchIndexStatsMany({
  league = {},
  season = {},
  team = {},
  target = 'current',
  players = [],
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamScope = buildPlayerSeasonScope({
    season: { ...season, seasonId, seasonKey },
    team,
  })
  const teamId = teamScope.birthTeamId
  const safePlayers = (Array.isArray(players) ? players : [])
    .filter(player => clean(player.fullName || player.externalPlayerId))
  const batch = writeBatch(db)
  let rowsCount = 0

  safePlayers.forEach(player => {
    const displayName = clean(player.fullName)
    const normalizedDisplayName = normalizeText(player.normalizedName || displayName)
    const externalPlayerId = clean(player.externalPlayerId)
    const playerId = buildInternalPlayerId({ player, season })
    const playerDocumentId = clean(player.playerDocumentId) || (hasPlayerScoutProfiles(player)
      ? buildPlayerDocumentId(player)
      : '')
    const primaryScoutSignal = Array.isArray(player.scoutSignals) ? player.scoutSignals[0] : null
    const secondaryScoutSignal = Array.isArray(player.scoutSignals) ? player.scoutSignals[1] : null
    const id = buildPlayerSeasonIndexId({
      seasonKey,
      teamId,
      birthTeamSlot: teamScope.birthTeamSlot,
      externalPlayerId,
      normalizedName: normalizedDisplayName,
    })
    if (!id || !teamId || !seasonKey) return

    rowsCount += 1
    batch.set(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, id),
      {
        id,
        entityType: 'playerSeason',
        entityId: id,
        displayName,
        normalizedDisplayName,
        playerId,
        externalPlayerId,
        playerDocumentId,
        playerUrl: clean(player.playerUrl),
        favorite: Boolean(player.favorite),
        notes: clean(player.notes),
        leagueId,
        seasonId,
        seasonKey,
        clubId: clean(team.clubId),
        clubLevel: resolveClubLevel({ clubId: team.clubId, clubLevel: team.clubLevel }),
        birthTeamId: teamId,
        birthTeamDocumentId: teamScope.birthTeamDocumentId,
        birthTeamSlot: teamScope.birthTeamSlot,
        teamId,
        teamDocumentId: teamScope.birthTeamDocumentId,
        teamUrl: clean(team.teamUrl),
        seasonUrl: clean(season.seasonUrl),
        seasonNotes: clean(player.notes),
        birthYear: toNumberOrZero(season.birthYear),
        leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
        primaryPosition: clean(player.primaryPosition),
        positionLayer: clean(player.positionLayer),
        numShirt: clean(player.numShirt),
        games: toNumberOrZero(player.playerStats?.games ?? player.games),
        goals: toNumberOrZero(player.playerStats?.goals ?? player.goals),
        yellowCards: toNumberOrZero(player.playerStats?.yellowCards ?? player.yellowCards),
        minutes: toNumberOrZero(player.playerStats?.minutes ?? player.minutes),
        starts: toNumberOrZero(player.playerStats?.starts ?? player.starts),
        substituteIn: toNumberOrZero(player.playerStats?.substituteIn ?? player.substituteIn),
        substitutedOut: toNumberOrZero(player.playerStats?.substitutedOut ?? player.substitutedOut),
        primaryScoutProfileId: clean(primaryScoutSignal?.profileId),
        primaryScoutReliabilityLevel: clean(primaryScoutSignal?.reliability?.level),
        primaryScoutScore: Number.isFinite(Number(primaryScoutSignal?.score)) ? Number(primaryScoutSignal.score) : null,
        secondaryScoutProfileId: clean(secondaryScoutSignal?.profileId),
        secondaryScoutReliabilityLevel: clean(secondaryScoutSignal?.reliability?.level),
        secondaryScoutScore: Number.isFinite(Number(secondaryScoutSignal?.score)) ? Number(secondaryScoutSignal.score) : null,
        sourceCollection: playerDocumentId ? 'players' : 'birthTeams',
        sourceDocumentId: playerDocumentId || teamScope.birthTeamDocumentId,
        sourceTarget: clean(target) === 'history' ? 'history' : 'current',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  if (rowsCount) {
    await batch.commit()
  }

  return {
    entityType: 'playerSeason',
    rowsCount,
  }
}

const buildPlayerSeasonIndexIdFromPayload = ({
  season = {},
  team = {},
  player = {},
} = {}) => {
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const displayName = clean(player.fullName)
  const normalizedDisplayName = normalizeText(player.normalizedName || displayName)
  const teamScope = buildPlayerSeasonScope({
    season: { ...season, seasonId, seasonKey },
    team,
  })

  return buildPlayerSeasonIndexId({
    seasonKey,
    teamId: teamScope.birthTeamId,
    birthTeamSlot: teamScope.birthTeamSlot,
    externalPlayerId: clean(player.externalPlayerId),
    normalizedName: normalizedDisplayName || clean(player.playerId),
  })
}

export async function updatePlayerSeasonSearchIndexFields({
  season = {},
  team = {},
  player = {},
  fields = {},
} = {}) {
  const id = buildPlayerSeasonIndexIdFromPayload({ season, team, player })
  if (!id) throw new Error('Missing player season index id')

  const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, id)
  const batch = writeBatch(db)

  batch.set(
    ref,
    {
      ...fields,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  await batch.commit()

  return {
    entityType: 'playerSeason',
    id,
    updated: true,
  }
}

export const updatePlayerSeasonSearchIndexNotes = payload =>
  updatePlayerSeasonSearchIndexFields({
    ...payload,
    fields: {
      notes: clean(payload.notes),
      seasonNotes: clean(payload.notes),
    },
  })

export const updatePlayerSeasonSearchIndexPlayerUrl = payload =>
  updatePlayerSeasonSearchIndexFields({
    ...payload,
    fields: {
      playerUrl: clean(payload.playerUrl),
    },
  })

export const updatePlayerSeasonSearchIndexRole = payload => {
  const scoutSignals = Array.isArray(payload?.player?.scoutSignals)
    ? payload.player.scoutSignals
    : []
  const primaryScoutSignal = scoutSignals[0] || null
  const secondaryScoutSignal = scoutSignals[1] || null

  return updatePlayerSeasonSearchIndexFields({
    ...payload,
    fields: {
      primaryPosition: clean(payload.primaryPosition),
      positionLayer: clean(payload.positionLayer),
      numShirt: clean(payload.numShirt),
      primaryScoutProfileId: clean(primaryScoutSignal?.profileId),
      primaryScoutReliabilityLevel: clean(primaryScoutSignal?.reliability?.level),
      primaryScoutScore: Number.isFinite(Number(primaryScoutSignal?.score)) ? Number(primaryScoutSignal.score) : null,
      secondaryScoutProfileId: clean(secondaryScoutSignal?.profileId),
      secondaryScoutReliabilityLevel: clean(secondaryScoutSignal?.reliability?.level),
      secondaryScoutScore: Number.isFinite(Number(secondaryScoutSignal?.score)) ? Number(secondaryScoutSignal.score) : null,
    },
  })
}

export const clearPlayerSeasonSearchIndexScoutProfile = payload =>
  updatePlayerSeasonSearchIndexFields({
    ...payload,
    fields: {
      primaryScoutProfileId: '',
      primaryScoutReliabilityLevel: '',
      primaryScoutScore: null,
      secondaryScoutProfileId: '',
      secondaryScoutReliabilityLevel: '',
      secondaryScoutScore: null,
    },
  })

export async function updatePlayerFavoriteSearchIndexes({
  player = {},
  favorite = false,
} = {}) {
  const playerId = clean(player.externalPlayerId)
    || normalizeText(player.normalizedName || player.fullName || player.playerId)
  if (!playerId) throw new Error('Missing player id')

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('playerId', '==', playerId)
  )
  const snapshot = await getDocs(rowsQuery)
  const batch = writeBatch(db)
  let rowsCount = 0

  snapshot.docs.forEach(indexDoc => {
    const data = indexDoc.data() || {}
    if (clean(data.entityType) !== 'playerSeason') return

    rowsCount += 1
    batch.set(
      indexDoc.ref,
      {
        favorite: Boolean(favorite),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  if (rowsCount) {
    await batch.commit()
  }

  return {
    entityType: 'playerSeason',
    rowsCount,
    favorite: Boolean(favorite),
  }
}

export async function updatePlayerSeasonSearchIndexesSeasonMeta({
  league = {},
  season = {},
  birthYear = null,
  leagueTotalRound = null,
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonKey) throw new Error('Missing season key')

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('leagueId', '==', leagueId),
    where('seasonKey', '==', seasonKey),
    where('entityType', '==', 'playerSeason')
  )
  const snapshot = await getDocs(rowsQuery)
  const batch = writeBatch(db)

  snapshot.docs.forEach(indexDoc => {
    batch.set(
      indexDoc.ref,
      {
        birthYear: toNumberOrZero(birthYear ?? season.birthYear),
        leagueTotalRound: toNumberOrZero(leagueTotalRound ?? season.leagueTotalRound),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  if (snapshot.docs.length) {
    await batch.commit()
  }

  return {
    entityType: 'playerSeason',
    rowsCount: snapshot.docs.length,
  }
}






