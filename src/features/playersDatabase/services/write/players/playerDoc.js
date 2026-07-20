// features/playersDatabase/services/write/players/playerDoc.js

import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../leagues/leagueDoc.js'
import {
  buildPlayerSeasonScope,
  isSamePlayerSeasonScope,
} from '../shared/playerSeasonScope.js'

const normalizeText = value =>
  clean(value).toLowerCase()

const normalizeIdPart = value =>
  normalizeText(value).replace(/[^0-9a-zA-Z\u0590-\u05FF]+/g, '_').replace(/^_+|_+$/g, '')

export const buildPlayerDocumentId = (player = {}) => {
  const externalPlayerId = clean(player.externalPlayerId)
  if (externalPlayerId) return `external__${normalizeIdPart(externalPlayerId)}`

  const normalizedName = normalizeText(player.normalizedName || player.fullName)
  return normalizedName ? `name__${normalizeIdPart(normalizedName)}` : ''
}

export const normalizePlayerScoutProfiles = player =>
  (Array.isArray(player?.scoutSignals) ? player.scoutSignals : [])
    .filter(signal => clean(signal.profileId))
    .map(signal => ({
      profileId: clean(signal.profileId),
      positionContext: clean(signal.positionContext),
      profileScore: Number.isFinite(Number(signal.score)) ? Number(signal.score) : null,
      profileReliability: signal.reliability?.level || signal.reliability?.score || null,
      profileWarnings: Array.isArray(signal.warnings) ? signal.warnings : [],
    }))

export const hasPlayerScoutProfiles = player =>
  normalizePlayerScoutProfiles(player).length > 0

const playerDocRef = playerDocumentId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.players, clean(playerDocumentId))

const buildPlayerBaseDoc = (player = {}, currentData = {}) => ({
  id: clean(player.playerDocumentId || buildPlayerDocumentId(player)),
  externalPlayerId: clean(player.externalPlayerId || currentData.externalPlayerId),
  fullName: clean(player.fullName || currentData.fullName),
  normalizedName: normalizeText(player.normalizedName || player.fullName || currentData.normalizedName),
  birthYear: currentData.birthYear ?? null,
  birthDate: currentData.birthDate ?? null,
  status: clean(currentData.status),
  favorite: player.favorite ?? Boolean(currentData.favorite),
  notes: clean(player.rootNotes || currentData.notes),
  current: Array.isArray(currentData.current) ? currentData.current : [],
  history: Array.isArray(currentData.history) ? currentData.history : [],
  createdAt: currentData.createdAt || serverTimestamp(),
  updatedAt: serverTimestamp(),
})

const upsertSeasonRows = ({
  rows = [],
  season = {},
  team = {},
  seasonDoc = {},
} = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const seasonScope = buildPlayerSeasonScope({ season, team })
  const seasonIndex = safeRows.findIndex(row => isSamePlayerSeasonScope(row, seasonScope))

  if (seasonIndex === -1) return [...safeRows, seasonDoc]

  return safeRows.map((row, index) => (
    index === seasonIndex
      ? { ...row, ...seasonDoc }
      : row
  ))
}

const buildPlayerSeasonDoc = ({
  season = {},
  team = {},
  player = {},
} = {}) => {
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const playerStats = player.playerStats || {}

  return {
    seasonId,
    seasonKey,
    leagueId: clean(season.leagueId || team.leagueId),
    clubId: clean(team.clubId),
    birthTeamId: clean(team.birthTeamId || team.teamId),
    birthTeamDocumentId: clean(team.birthTeamDocumentId || team.teamDocumentId || team.birthTeamId || team.teamId),
    birthTeamSlot: toNumberOrZero(team.birthTeamSlot || team.teamSlot) || 1,
    teamId: clean(team.birthTeamId || team.teamId),
    playerUrl: clean(player.playerUrl),
    notes: clean(player.notes),
    primaryPosition: clean(player.primaryPosition),
    positionLayer: clean(player.positionLayer),
    numShirt: clean(player.numShirt),
    playerStats: {
      games: toNumberOrZero(playerStats.games ?? player.games),
      goals: toNumberOrZero(playerStats.goals ?? player.goals),
      yellowCards: toNumberOrZero(playerStats.yellowCards ?? player.yellowCards),
      minutes: toNumberOrZero(playerStats.minutes ?? player.minutes),
      starts: toNumberOrZero(playerStats.starts ?? player.starts),
      substituteIn: toNumberOrZero(playerStats.substituteIn ?? player.substituteIn),
      substitutedOut: toNumberOrZero(playerStats.substitutedOut ?? player.substitutedOut),
      teamMinutes: 0,
      teamGames: toNumberOrZero(team.teamStats?.teamGamePlayed ?? team.teamGamePlayed),
      teamRank: toNumberOrZero(team.tableRank),
      teamGoalsFor: toNumberOrZero(team.teamStats?.goalsFor ?? team.goalsFor),
      teamGoalsAgainst: toNumberOrZero(team.teamStats?.goalsAgainst ?? team.goalsAgainst),
      teamAttackPerformance: null,
      teamDefensePerformance: null,
    },
    scoutProfiles: normalizePlayerScoutProfiles(player),
    updatedAt: new Date().toISOString(),
  }
}

const upsertProfiledPlayerDoc = async ({
  season = {},
  team = {},
  target = 'current',
  player = {},
} = {}) => {
  const playerDocumentId = buildPlayerDocumentId(player)
  const seasonId = clean(season.seasonId)
  if (!playerDocumentId) return { skipped: true, reason: 'missingPlayerDocumentId' }
  if (!seasonId) throw new Error('Missing season id')

  const ref = playerDocRef(playerDocumentId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildPlayerBaseDoc({ ...player, playerDocumentId }, currentData)
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const seasonDoc = buildPlayerSeasonDoc({
      season: { ...season, seasonId, seasonKey },
      team,
      player,
    })
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: upsertSeasonRows({
            rows: baseDoc.history,
            season: { ...season, seasonId, seasonKey },
            team,
            seasonDoc,
          }),
        }
      : {
          ...baseDoc,
          current: upsertSeasonRows({
            rows: baseDoc.current,
            season: { ...season, seasonId, seasonKey },
            team,
            seasonDoc,
          }),
        }

    transaction.set(ref, nextData, { merge: true })

    return {
      playerDocumentId,
      created: !snapshot.exists(),
      scoutProfilesCount: seasonDoc.scoutProfiles.length,
    }
  })
}

export const upsertOfficialPlayerDoc = upsertProfiledPlayerDoc

const patchPlayerSeason = async ({
  season = {},
  team = {},
  player = {},
  target = 'current',
  patch = {},
} = {}) => {
  const playerDocumentId = clean(player.playerDocumentId || buildPlayerDocumentId(player))
  const seasonId = clean(season.seasonId)
  if (!playerDocumentId) throw new Error('Missing player document id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = playerDocRef(playerDocumentId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        playerDocumentId,
        seasonId,
        updated: false,
        reason: 'playerDocMissing',
      }
    }

    const data = snapshot.data() || {}
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const fieldKey = isHistory ? 'history' : 'current'
    const rows = Array.isArray(data[fieldKey]) ? data[fieldKey] : []
    const seasonScope = buildPlayerSeasonScope({
      season: { ...season, seasonId, seasonKey },
      team,
    })
    const seasonIndex = rows.findIndex(row => isSamePlayerSeasonScope(row, seasonScope))
    if (seasonIndex === -1) {
      return {
        playerDocumentId,
        seasonId,
        seasonKey,
        updated: false,
        reason: 'playerSeasonMissing',
      }
    }

    const nextRows = rows.map((row, index) => (
      index === seasonIndex
        ? {
            ...row,
            ...patch,
            updatedAt: new Date().toISOString(),
          }
        : row
    ))

    transaction.set(
      ref,
      {
        [fieldKey]: nextRows,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      playerDocumentId,
      seasonId,
      seasonKey,
      updated: true,
    }
  })
}

export const updatePlayerSeasonNotes = ({ notes = '', ...payload } = {}) =>
  patchPlayerSeason({
    ...payload,
    patch: {
      notes: clean(notes),
    },
  })

export const updatePlayerSeasonUrl = ({ playerUrl = '', ...payload } = {}) =>
  patchPlayerSeason({
    ...payload,
    patch: {
      playerUrl: clean(playerUrl),
    },
  })

export const updatePlayerSeasonRole = ({
  player = {},
  primaryPosition = '',
  positionLayer = '',
  numShirt = '',
  ...payload
} = {}) =>
  patchPlayerSeason({
    ...payload,
    player,
    patch: {
      primaryPosition: clean(primaryPosition),
      positionLayer: clean(positionLayer),
      numShirt: clean(numShirt),
      scoutProfiles: normalizePlayerScoutProfiles(player),
    },
  })

export const removePlayerSeasonScoutProfile = ({
  profileId = '',
  ...payload
} = {}) => {
  const removeProfileId = clean(profileId)
  const currentProfiles = Array.isArray(payload.player?.scoutProfiles)
    ? payload.player.scoutProfiles
    : []

  return patchPlayerSeason({
    ...payload,
    patch: {
      scoutProfiles: removeProfileId
        ? currentProfiles.filter(profile => clean(profile.profileId) !== removeProfileId)
        : [],
    },
  })
}

export async function updatePlayerFavorite({
  player = {},
  favorite = false,
} = {}) {
  const playerDocumentId = clean(player.playerDocumentId || buildPlayerDocumentId(player))
  if (!playerDocumentId) throw new Error('Missing player document id')

  const ref = playerDocRef(playerDocumentId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        playerDocumentId,
        updated: false,
        reason: 'playerDocMissing',
      }
    }

    transaction.set(
      ref,
      {
        favorite: Boolean(favorite),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      playerDocumentId,
      favorite: Boolean(favorite),
      updated: true,
    }
  })
}

const clearExistingPlayerSeasonProfiles = async ({
  season = {},
  team = {},
  target = 'current',
  player = {},
} = {}) => {
  const playerDocumentId = buildPlayerDocumentId(player)
  const seasonId = clean(season.seasonId)
  if (!playerDocumentId) return { skipped: true, reason: 'missingPlayerDocumentId' }
  if (!seasonId) throw new Error('Missing season id')

  const ref = playerDocRef(playerDocumentId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        playerDocumentId,
        updated: false,
        skipped: true,
        reason: 'playerDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const baseDoc = buildPlayerBaseDoc({ ...player, playerDocumentId }, currentData)
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const rows = isHistory ? baseDoc.history : baseDoc.current
    const existingSeason = (Array.isArray(rows) ? rows : [])
      .find(row => isSamePlayerSeasonScope(row, buildPlayerSeasonScope({
        season: { ...season, seasonId, seasonKey },
        team,
      })))
    if (!existingSeason) {
      return {
        playerDocumentId,
        updated: false,
        skipped: true,
        reason: 'playerSeasonMissing',
      }
    }
    const seasonDoc = buildPlayerSeasonDoc({
      season: { ...season, seasonId, seasonKey },
      team,
      player: {
        ...player,
        scoutSignals: [],
      },
    })
    const nextRows = upsertSeasonRows({
      rows,
      season: { ...season, seasonId, seasonKey },
      team,
      seasonDoc,
    })

    transaction.set(
      ref,
      {
        ...(isHistory ? { history: nextRows } : { current: nextRows }),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      playerDocumentId,
      updated: true,
      scoutProfilesCount: 0,
    }
  })
}

export async function upsertProfiledPlayerDocsMany({
  season = {},
  team = {},
  target = 'current',
  players = [],
} = {}) {
  const profiledPlayers = (Array.isArray(players) ? players : [])
    .filter(hasPlayerScoutProfiles)
  const results = []

  for (const player of profiledPlayers) {
    results.push(await upsertProfiledPlayerDoc({
      season,
      team,
      target,
      player,
    }))
  }

  return {
    rowsCount: results.length,
    createdCount: results.filter(result => result.created).length,
    playerDocumentIds: results.map(result => result.playerDocumentId).filter(Boolean),
  }
}

export async function syncPlayerScoutProfileDocsMany({
  season = {},
  team = {},
  target = 'current',
  players = [],
} = {}) {
  const safePlayers = Array.isArray(players) ? players : []
  const results = []

  for (const player of safePlayers) {
    results.push(
      hasPlayerScoutProfiles(player)
        ? await upsertProfiledPlayerDoc({
            season,
            team,
            target,
            player,
          })
        : await clearExistingPlayerSeasonProfiles({
            season,
            team,
            target,
            player,
          })
    )
  }

  return {
    rowsCount: results.filter(result => !result.skipped).length,
    createdCount: results.filter(result => result.created).length,
    clearedCount: results.filter(result => result.updated && result.scoutProfilesCount === 0).length,
    skippedCount: results.filter(result => result.skipped).length,
    playerDocumentIds: results.map(result => result.playerDocumentId).filter(Boolean),
  }
}


