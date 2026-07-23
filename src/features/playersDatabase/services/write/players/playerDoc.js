// features/playersDatabase/services/write/players/playerDoc.js

import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../leagues/leagueDoc.js'
import { getTeamById } from '../../read/team.js'
import {
  buildPlayerDocumentId as buildCanonicalPlayerDocumentId,
  buildPlayerMatchValues,
  normalizePlayerNameValue,
} from '../../../model/playerIdentity.model.js'
import { normalizePlayerStats } from '../../../model/playerStats.model.js'

export const buildPlayerDocumentId = player =>
  buildCanonicalPlayerDocumentId(player)

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

const getPlayerIdentityKeys = entity =>
  new Set(
    buildPlayerMatchValues(entity)
      .map(value => clean(value).toLowerCase())
      .filter(Boolean)
  )

const isSamePlayerSource = (candidate = {}, player = {}) => {
  const candidateKeys = getPlayerIdentityKeys(candidate)
  const playerKeys = getPlayerIdentityKeys(player)

  for (const key of playerKeys) {
    if (candidateKeys.has(key)) return true
  }

  return false
}

const getTeamSeasonRows = teamDoc => [
  ...(Array.isArray(teamDoc?.current)
    ? teamDoc.current.map(row => ({
        ...row,
        __sourceTarget: 'current',
      }))
    : []),
  ...(Array.isArray(teamDoc?.history)
    ? teamDoc.history.map(row => ({
        ...row,
        __sourceTarget: 'history',
      }))
    : []),
]

const getPlayerSeasonRowKey = (row = {}) => [
  clean(row.seasonKey || row.seasonId),
  clean(row.birthTeamId || row.teamId),
  clean(row.clubId),
].filter(Boolean).join('__')

const playerDocRef = playerDocumentId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.players, clean(playerDocumentId))

const getPlayerSeasonRowTeamId = (row = {}) =>
  clean(row.birthTeamId || row.teamId)

const getTargetSeasonRowTeamId = ({
  season = {},
  team = {},
} = {}) =>
  clean(
    team.birthTeamId ||
    team.teamId ||
    season.birthTeamId ||
    season.teamId
  )

const isSamePlayerSeasonRow = ({
  row = {},
  season = {},
  team = {},
} = {}) => {
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const rowSeasonId = clean(row.seasonId)
  const rowSeasonKey = clean(row.seasonKey)

  if (
    (seasonKey && rowSeasonKey && rowSeasonKey !== seasonKey) ||
    (seasonId && rowSeasonId && rowSeasonId !== seasonId)
  ) {
    return false
  }

  const targetTeamId = getTargetSeasonRowTeamId({ season, team })
  if (!targetTeamId) return true

  return getPlayerSeasonRowTeamId(row) === targetTeamId
}

const findPlayerSeasonRowIndex = ({
  rows = [],
  season = {},
  team = {},
} = {}) =>
  (Array.isArray(rows) ? rows : []).findIndex(row => isSamePlayerSeasonRow({
    row,
    season,
    team,
  }))

const buildPlayerBaseDoc = (player = {}, currentData = {}, season = {}, team = {}) => ({
  id: clean(player.playerDocumentId || buildPlayerDocumentId(player)),
  externalPlayerId: clean(player.externalPlayerId || currentData.externalPlayerId),
  fullName: clean(player.fullName || currentData.fullName),
  normalizedName: normalizePlayerNameValue(
    player.normalizedName || player.fullName || currentData.normalizedName
  ),
  birthYear: toNumberOrZero(
    player.birthYear ??
    season.birthYear ??
    team.birthYear ??
    currentData.birthYear
  ) || null,
  birthDate: currentData.birthDate ?? null,
  status: clean(currentData.status),
  favorite: player.favorite ?? Boolean(currentData.favorite),
  notes: clean(player.rootNotes || currentData.notes),
  primaryPosition: clean(player.primaryPosition || currentData.primaryPosition),
  positionLayer: clean(player.positionLayer || currentData.positionLayer),
  numShirt: clean(player.numShirt || currentData.numShirt),
  scoutProfiles: Array.isArray(player.scoutProfiles)
    ? player.scoutProfiles
    : Array.isArray(currentData.scoutProfiles)
      ? currentData.scoutProfiles
      : [],
  current: Array.isArray(currentData.current) ? currentData.current : [],
  history: Array.isArray(currentData.history) ? currentData.history : [],
  createdAt: currentData.createdAt || serverTimestamp(),
  updatedAt: serverTimestamp(),
})

const buildPlayerSeasonRowsFromTeamDoc = ({
  teamDoc = {},
  season = {},
  team = {},
  player = {},
  target = 'current',
} = {}) => {
  const seasonRows = getTeamSeasonRows(teamDoc)
  const collectedRows = []

  seasonRows.forEach(seasonRow => {
    const teamPlayers = Array.isArray(seasonRow.teamPlayers) ? seasonRow.teamPlayers : []
    const matchedPlayer = teamPlayers.find(nextPlayer => isSamePlayerSource(nextPlayer, player))

    if (!matchedPlayer) return

    collectedRows.push({
      row: buildPlayerSeasonDoc({
        season: {
          ...season,
          ...seasonRow,
          seasonId: clean(seasonRow.seasonId || season.seasonId),
          seasonKey: clean(seasonRow.seasonKey || season.seasonKey),
        },
        team: {
          ...teamDoc,
          ...team,
          ...seasonRow,
        },
        player: {
          ...matchedPlayer,
          ...player,
        },
      }),
      sourceTarget: clean(seasonRow.__sourceTarget) || 'history',
    })
  })

  const fallbackRow = buildPlayerSeasonDoc({
    season,
    team,
    player,
  })

  collectedRows.push({
    row: fallbackRow,
    sourceTarget: clean(target) === 'history' ? 'history' : 'current',
  })

  const rowsByKey = new Map()

  collectedRows.forEach(({ row, sourceTarget }) => {
    const key = getPlayerSeasonRowKey(row)
    if (!key) return

    rowsByKey.set(key, {
      ...row,
      sourceTarget,
    })
  })

  const rows = [...rowsByKey.values()]

  return {
    current: rows
      .filter(row => row.sourceTarget !== 'history')
      .map(({ sourceTarget, ...row }) => row),
    history: rows
      .filter(row => row.sourceTarget === 'history')
      .map(({ sourceTarget, ...row }) => row),
  }
}

const upsertSeasonRows = ({
  rows = [],
  season = {},
  team = {},
  seasonDoc = {},
} = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const seasonIndex = findPlayerSeasonRowIndex({
    rows: safeRows,
    season,
    team,
  })

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
  const playerStats = normalizePlayerStats(player)
  const clubId = clean(team.clubId)
  const clubName = clean(team.clubName || team.displayName || team.teamName)
  const ageGroupId = clean(season.ageGroupId || team.ageGroupId)
  const ageGroupLabel = clean(
    season.ageGroupLabel ||
    team.ageGroupLabel ||
    season.ageGroupId ||
    team.ageGroupId
  )

  return {
    seasonId,
    seasonKey,
    leagueId: clean(season.leagueId || team.leagueId),
    leagueName: clean(season.leagueName || team.leagueName),
    ageGroupId,
    ageGroupLabel,
    clubId,
    clubName,
    teamName: clubName,
    birthTeamId: clean(team.birthTeamId || team.teamId),
    birthTeamDocumentId: clean(team.birthTeamDocumentId || team.teamDocumentId || team.birthTeamId || team.teamId),
    birthTeamSlot: toNumberOrZero(team.birthTeamSlot || team.teamSlot) || 1,
    teamId: clean(team.birthTeamId || team.teamId),
    birthYear: toNumberOrZero(season.birthYear || team.birthYear || player.birthYear) || null,
    playerUrl: clean(player.playerUrl),
    notes: clean(player.notes),
    primaryPosition: clean(player.primaryPosition),
    positionLayer: clean(player.positionLayer),
    numShirt: clean(player.numShirt),
    playerStats: {
      games: playerStats.games,
      goals: playerStats.goals,
      yellowCards: playerStats.yellowCards,
      minutes: playerStats.minutes,
      starts: playerStats.starts,
      substituteIn: playerStats.substituteIn,
      substitutedOut: playerStats.substitutedOut,
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
  const teamDocumentId = clean(
    team.birthTeamDocumentId ||
    team.birthTeamId ||
    team.teamDocumentId ||
    team.teamId
  )
  const teamDoc = teamDocumentId ? await getTeamById(teamDocumentId) : null
  const resolvedTeam = teamDoc ? { ...teamDoc, ...team } : team

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildPlayerBaseDoc({ ...player, playerDocumentId }, currentData, season, resolvedTeam)
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const seasonDoc = buildPlayerSeasonDoc({
      season: { ...season, seasonId, seasonKey },
      team: resolvedTeam,
      player,
    })

    const shouldHydrateFromTeamDoc = !snapshot.exists() && teamDoc
    const hydratedRows = shouldHydrateFromTeamDoc
      ? buildPlayerSeasonRowsFromTeamDoc({
          teamDoc,
          season: { ...season, seasonId, seasonKey },
          team: resolvedTeam,
          player,
          target: isHistory ? 'history' : 'current',
        })
      : {
          current: [],
          history: [],
        }

    const nextData = snapshot.exists()
      ? (
          isHistory
            ? {
                ...baseDoc,
                history: upsertSeasonRows({
                  rows: baseDoc.history,
                  season: { ...season, seasonId, seasonKey },
                  team: resolvedTeam,
                  seasonDoc,
                }),
              }
            : {
                ...baseDoc,
                current: upsertSeasonRows({
                  rows: baseDoc.current,
                  season: { ...season, seasonId, seasonKey },
                  team: resolvedTeam,
                  seasonDoc,
                }),
              }
        )
      : {
          ...baseDoc,
          current: hydratedRows.current.length ? hydratedRows.current : [seasonDoc],
          history: hydratedRows.history,
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
    const seasonIndex = findPlayerSeasonRowIndex({
      rows,
      season: { ...season, seasonId, seasonKey },
      team,
    })
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
    const baseDoc = buildPlayerBaseDoc({ ...player, playerDocumentId }, currentData, season, team)
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const rows = isHistory ? baseDoc.history : baseDoc.current
    const existingSeasonIndex = findPlayerSeasonRowIndex({
      rows,
      season: { ...season, seasonId, seasonKey },
      team,
    })
    if (existingSeasonIndex === -1) {
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

export async function syncPlayerRoleAndScoutProfileDoc({
  season = {},
  team = {},
  target = 'current',
  player = {},
} = {}) {
  return hasPlayerScoutProfiles(player)
    ? upsertProfiledPlayerDoc({
        season,
        team,
        target,
        player,
      })
    : clearExistingPlayerSeasonProfiles({
        season,
        team,
        target,
        player,
      })
}

export async function syncPlayerScoutProfileDocsMany({
  season = {},
  team = {},
  target = 'current',
  players = [],
} = {}) {
  const safePlayers = Array.isArray(players) ? players : []
  const results = []
  const failures = []

  for (const player of safePlayers) {
    try {
      results.push(await syncPlayerRoleAndScoutProfileDoc({
        season,
        team,
        target,
        player,
      }))
    } catch (error) {
      failures.push({
        playerDocumentId: clean(player.playerDocumentId || buildPlayerDocumentId(player)),
        playerId: clean(player.playerId || player.externalPlayerId),
        fullName: clean(player.fullName || player.matchedPlayerName),
        message: clean(error?.message) || 'Player document sync failed',
      })
    }
  }

  return {
    rowsCount: results.filter(result => !result.skipped).length,
    createdCount: results.filter(result => result.created).length,
    clearedCount: results.filter(result => result.updated && result.scoutProfilesCount === 0).length,
    skippedCount: results.filter(result => result.skipped).length,
    failedCount: failures.length,
    failures,
    playerDocumentIds: results.map(result => result.playerDocumentId).filter(Boolean),
  }
}
