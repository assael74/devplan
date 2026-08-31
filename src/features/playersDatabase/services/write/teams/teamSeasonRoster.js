// features/playersDatabase/services/write/teams/teamSeasonRoster.js

import { db } from '../../../../../services/firebase/firebase.js'
import { clean } from '../leagues/leagueDoc.js'
import { normalizeSeasonIdentity } from '../../../model/season.model.js'
import { resolveTeamLookupKey } from '../../../model/teamIdentity.model.js'
import { buildTeamRootWithSeasonIndex, teamDocRef } from './teamDoc.js'
import {
  buildPlayerLookup,
  buildTeamSeasonDoc,
  findExistingPlayerIndex,
  normalizeTeamPlayer,
  normalizeTeamSeasonRosterState,
} from './teamSeason.model.js'
import {
  buildTeamSeasonDocumentData,
  teamSeasonDocRef,
} from './teamSeasonDoc.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { withTeamBalanceSnapshot } from './teamBalanceSnapshot.js'
import {
  applyTeamPerformanceProjection,
  buildPersistedTeamPerformanceFallback,
} from '../shared/teamPerformanceProjection.js'

const withRosterPerformanceContext = ({
  seasonDoc = {},
  existingSeason = null,
  teamPerformance = null,
} = {}) => applyTeamPerformanceProjection({
  team: seasonDoc,
  performance: teamPerformance || buildPersistedTeamPerformanceFallback(existingSeason || seasonDoc),
})

const buildEffectiveSeason = ({ season = {} } = {}) => {
  const { seasonId, seasonKey } = normalizeSeasonIdentity({ season })
  if (!seasonId && !seasonKey) throw new Error('Missing season id')
  const seasonStatus = clean(season.seasonStatus)

  if (!['active', 'completed'].includes(seasonStatus)) {
    const error = new Error('League season lifecycle could not be resolved')
    error.code = 'LEAGUE_SEASON_LIFECYCLE_UNRESOLVED'
    throw error
  }

  return {
    ...season,
    seasonId,
    seasonKey,
    seasonStatus,
  }
}

const resolvePersistedSeasonStatus = ({ existingStatus, incomingStatus } = {}) => (
  clean(existingStatus) === 'completed' || clean(incomingStatus) === 'completed'
    ? 'completed'
    : 'active'
)

const syncRootSeasonIndexInTransaction = ({
  transaction,
  rootRef,
  team,
  rootSnapshot,
  season,
}) => {
  transaction.set(rootRef, buildTeamRootWithSeasonIndex({
    team: {
      ...team,
      birthTeamDocumentId: rootRef.id,
    },
    currentData: rootSnapshot.exists() ? rootSnapshot.data() || {} : {},
    season,
  }))

  return !rootSnapshot.exists()
}

const buildBalanceRootContext = ({ team, teamId }) => ({
  ...team,
  id: teamId,
  birthTeamDocumentId: teamId,
})

export async function upsertTeamSeasonPlayers({
  season = {},
  team = {},
  players = [],
  teamPerformance = null,
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  if (!teamId) throw new Error('Missing birth team id')

  const effectiveSeason = buildEffectiveSeason({ season })
  const rootRef = teamDocRef(teamId)
  const seasonRef = teamSeasonDocRef({
    birthTeamDocumentId: teamId,
    seasonKey: effectiveSeason.seasonKey,
  })

  return trackedRunTransaction(db, async transaction => {
    const [rootSnapshot, seasonSnapshot] = await Promise.all([
      transaction.get(rootRef),
      transaction.get(seasonRef),
    ])
    const existingSeason = seasonSnapshot.exists() ? seasonSnapshot.data() || {} : null
    const persistedSeasonScope = {
      ...effectiveSeason,
      seasonStatus: resolvePersistedSeasonStatus({
        existingStatus: existingSeason?.seasonStatus,
        incomingStatus: effectiveSeason.seasonStatus,
      }),
    }

    if (Array.isArray(existingSeason?.teamPlayers) && existingSeason.teamPlayers.length > 0) {
      const error = new Error('Team roster already exists for this season')
      error.code = 'TEAM_ROSTER_ALREADY_EXISTS'
      error.seasonId = effectiveSeason.seasonId
      error.teamId = teamId
      throw error
    }

    const seasonDocWithoutBalance = withRosterPerformanceContext({
      seasonDoc: buildTeamSeasonDoc({
        season: persistedSeasonScope,
        team: { ...team, birthTeamDocumentId: teamId, teamDocumentId: teamId },
        players,
      }),
      existingSeason,
      teamPerformance,
    })
    const seasonDoc = withTeamBalanceSnapshot({
      seasonDoc: seasonDocWithoutBalance,
      teamRoot: buildBalanceRootContext({ team, teamId }),
    })
    const persistedSeason = buildTeamSeasonDocumentData({
      team: { ...team, birthTeamDocumentId: teamId },
      season: persistedSeasonScope,
      seasonDoc,
      existingData: existingSeason || {},
    })

    const createdTeam = syncRootSeasonIndexInTransaction({
      transaction,
      rootRef,
      team,
      rootSnapshot,
      season: persistedSeason,
    })
    transaction.set(seasonRef, persistedSeason)

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      teamSeasonDocumentId: seasonRef.id,
      seasonId: persistedSeasonScope.seasonId,
      seasonKey: persistedSeasonScope.seasonKey,
      target: persistedSeasonScope.seasonStatus === 'completed' ? 'history' : 'current',
      playersCount: persistedSeason.teamPlayers.length,
      createdTeam,
      players: persistedSeason.teamPlayers,
      teamBalance: persistedSeason.teamBalance || null,
      seasonDocument: persistedSeason,
    }
  })
}

export async function appendTeamSeasonPlayer({
  season = {},
  team = {},
  player = {},
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  if (!teamId) throw new Error('Missing birth team id')

  const effectiveSeason = buildEffectiveSeason({ season })
  const ref = teamSeasonDocRef({
    birthTeamDocumentId: teamId,
    seasonKey: effectiveSeason.seasonKey,
  })

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) throw new Error('Team season not found')

    const existingSeason = snapshot.data() || {}
    const persistedSeasonScope = {
      ...effectiveSeason,
      seasonStatus: resolvePersistedSeasonStatus({
        existingStatus: existingSeason.seasonStatus,
        incomingStatus: effectiveSeason.seasonStatus,
      }),
    }
    const existingPlayers = Array.isArray(existingSeason.teamPlayers)
      ? existingSeason.teamPlayers
      : []
    const normalizedPlayer = normalizeTeamPlayer(player, persistedSeasonScope)
    const existingIndex = findExistingPlayerIndex({
      lookup: buildPlayerLookup(existingPlayers),
      player: normalizedPlayer,
    })

    if (existingIndex !== -1) {
      const error = new Error('Player already exists in team roster')
      error.code = 'TEAM_PLAYER_ALREADY_EXISTS'
      error.playerId = normalizedPlayer.playerId
      throw error
    }

    const nextPlayers = [...existingPlayers, normalizedPlayer]
    const nextSeason = withTeamBalanceSnapshot({
      seasonDoc: normalizeTeamSeasonRosterState({
        seasonDoc: existingSeason,
        season: persistedSeasonScope,
        team: { ...team, birthTeamDocumentId: teamId },
        players: nextPlayers,
      }),
      teamRoot: buildBalanceRootContext({ team, teamId }),
    })
    const persistedSeason = buildTeamSeasonDocumentData({
      team: { ...team, birthTeamDocumentId: teamId },
      season: persistedSeasonScope,
      seasonDoc: nextSeason,
      existingData: existingSeason,
    })
    transaction.set(ref, persistedSeason)

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      teamSeasonDocumentId: ref.id,
      seasonId: persistedSeasonScope.seasonId,
      seasonKey: persistedSeasonScope.seasonKey,
      target: persistedSeasonScope.seasonStatus === 'completed' ? 'history' : 'current',
      playersCount: nextPlayers.length,
      players: persistedSeason.teamPlayers,
      player: normalizedPlayer,
      teamBalance: persistedSeason.teamBalance || null,
      seasonDocument: persistedSeason,
    }
  })
}
