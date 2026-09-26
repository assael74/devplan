// src/features/playersDatabase/domain/statsV2/teamSeasonStats.builder.js

import { buildScoutProfilesSummary } from '../../model/scout/scoutProfilesSummary.model.js'
import { countCurrentRosterPlayers } from '../../model/team/rosterStatus.model.js'
import { buildPlayerLineClassificationState } from '../orchestration/buildPlayerLineClassificationState.js'
import { buildPlayerScoutState } from '../orchestration/buildPlayerScoutState.js'
import { buildTeamBalanceState } from '../orchestration/buildTeamBalanceState.js'
import {
  buildTeamPlayerScoutProjection,
  buildTeamPlayerSeasonalScoutProjection,
} from '../projections/playerScout.projection.js'
import {
  buildLeagueTeamPerformanceProjection,
  resolveLeagueSeasonStatus,
} from '../projections/teamPerformance.projection.js'
import { buildLeagueTeamSeasons } from '../orchestration/buildLeagueTeamSeasons.js'
import {
  resolveStatsPlayerIdentityKey,
  STATS_RELOAD_DECISION,
} from './statsReloadDecision.builder.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const isObject = value => (
  value &&
  typeof value === 'object' &&
  !Array.isArray(value)
)

const clone = value => JSON.parse(JSON.stringify(value))

const sameValue = (left, right) => (
  JSON.stringify(left === undefined ? null : left) ===
  JSON.stringify(right === undefined ? null : right)
)

const resolveDecisionLookup = reloadDecisionState => new Map(
  (Array.isArray(reloadDecisionState?.resolved) ? reloadDecisionState.resolved : [])
    .map(row => [clean(row?.playerKey), clean(row?.decision)])
    .filter(([playerKey]) => playerKey)
)

const resolveIncomingLookup = players => {
  const rows = Array.isArray(players) ? players : []
  const entries = rows.map(player => [resolveStatsPlayerIdentityKey(player), player])
  const invalidRow = entries.find(([playerKey]) => !playerKey)

  if (invalidRow) {
    const error = new Error('Every incoming Stats row requires a resolved player identity')
    error.code = 'STATS_PLAYER_IDENTITY_REQUIRED'
    throw error
  }

  const keys = entries.map(([playerKey]) => playerKey)
  if (new Set(keys).size !== keys.length) {
    const error = new Error('Incoming Stats contains duplicate player identities')
    error.code = 'STATS_PLAYER_IDENTITY_DUPLICATE'
    throw error
  }

  return new Map(entries)
}

const clearStatsOwnedScoutFields = player => ({
  ...player,
  statsStatus: 'missing',
  playerStats: {},
  lineClassification: null,
  scoutSignals: [],
  scoutProfiles: [],
  scoutProfileHierarchy: null,
  scoutOpportunity: null,
  scoutPlayerInterest: null,
  primaryScoutProfileId: '',
  primaryScoutProfileStrengthDepthPct: null,
  professionalScoutProfileIds: [],
  preliminaryScoutProfileIds: [],
  scoutEffectiveImmediacyStatus: '',
  scoutPlayerInterestLevel: '',
})

const buildScoutedPlayer = ({ player, team, season }) => {
  if (clean(player?.statsStatus) !== 'loaded') {
    return clearStatsOwnedScoutFields(player)
  }

  const lineClassification = buildPlayerLineClassificationState({ player })
  const seasonalProjection = buildTeamPlayerSeasonalScoutProjection({
    player: {
      ...player,
      lineClassification,
    },
    team,
    season,
  })
  const scoutState = buildPlayerScoutState({
    player: {
      ...player,
      ...seasonalProjection,
      lineClassification,
    },
    team,
    season,
  })

  return {
    ...player,
    ...scoutState,
    ...buildTeamPlayerScoutProjection(scoutState),
    lineClassification,
  }
}

const applyApprovedMovementDecision = player => {
  const decision = clean(player?.statsMovementDecision)

  if (decision === 'left') {
    return { ...player, rosterStatus: 'left' }
  }

  if (decision === 'youngerAgeGroup') {
    return { ...player, rosterStatus: 'youngerAgeGroup' }
  }

  return player
}

const resolveCanonicalLeagueSeason = ({ league = {}, season = {} } = {}) => {
  const seasonStatus = clean(season.seasonStatus)
  const seasonKey = clean(season.seasonKey)

  if (seasonStatus === 'active') {
    const current = league.current || null
    return current && clean(current.seasonKey) === seasonKey
      ? current
      : null
  }

  if (seasonStatus === 'completed') {
    const history = Array.isArray(league.history) ? league.history : []
    return history.find(item => clean(item?.seasonKey) === seasonKey) || null
  }

  return null
}

const resolveCanonicalTeamScout = ({ league = {}, season = {}, team = {} } = {}) => {
  const leagueSeason = resolveCanonicalLeagueSeason({
    league,
    season,
  })

  if (!leagueSeason) {
    const error = new Error('Canonical League season is required for Team Scout')
    error.code = 'STATS_LEAGUE_SEASON_NOT_FOUND'
    throw error
  }

  const teamSeasons = buildLeagueTeamSeasons({
    leagueDocument: league,
    seasonDocument: leagueSeason,
    target: season.seasonStatus === 'completed' ? 'history' : 'current',
  })
  const teamId = clean(team.birthTeamDocumentId || team.teamDocumentId || team.teamId)
  const matches = teamSeasons.filter(item => {
    const identity = item?.identity || {}
    return [
      identity.teamId,
      identity.teamDocumentId,
      identity.birthTeamId,
      identity.birthTeamDocumentId,
    ].map(clean).includes(teamId)
  })

  if (matches.length !== 1 || !matches[0]?.performance) {
    const error = new Error('Canonical Team Scout could not be resolved from League')
    error.code = 'STATS_TEAM_SCOUT_UNRESOLVED'
    throw error
  }

  return matches[0].performance
}

const mergeResolvedPlayers = ({
  existingPlayers,
  incomingPlayers,
  reloadDecisionState,
}) => {
  const incomingLookup = resolveIncomingLookup(incomingPlayers)
  const decisionLookup = resolveDecisionLookup(reloadDecisionState)
  const consumedIncomingKeys = new Set()

  const mergedExisting = (Array.isArray(existingPlayers) ? existingPlayers : []).map(existingPlayer => {
    const playerKey = resolveStatsPlayerIdentityKey(existingPlayer)
    const incomingPlayer = playerKey ? incomingLookup.get(playerKey) : null

    if (incomingPlayer) {
      consumedIncomingKeys.add(playerKey)
      return {
        ...existingPlayer,
        ...applyApprovedMovementDecision(incomingPlayer),
        rosterStatus: clean(incomingPlayer.statsMovementDecision)
          ? applyApprovedMovementDecision(incomingPlayer).rosterStatus
          : existingPlayer.rosterStatus,
      }
    }

    const decision = decisionLookup.get(playerKey)

    if (decision === STATS_RELOAD_DECISION.REMOVE_STATS) {
      return clearStatsOwnedScoutFields(existingPlayer)
    }

    return existingPlayer
  })

  const appendedPlayers = [...incomingLookup.entries()]
    .filter(([playerKey]) => !consumedIncomingKeys.has(playerKey))
    .map(([, player]) => applyApprovedMovementDecision(player))

  return [...mergedExisting, ...appendedPlayers]
}

const buildPlayerOwnedPatches = ({ previousPlayers, nextPlayers }) => {
  const previousLookup = new Map(
    (Array.isArray(previousPlayers) ? previousPlayers : [])
      .map(player => [resolveStatsPlayerIdentityKey(player), player])
      .filter(([playerKey]) => playerKey)
  )

  return (Array.isArray(nextPlayers) ? nextPlayers : []).reduce((patches, player) => {
    const playerKey = resolveStatsPlayerIdentityKey(player)
    if (!playerKey) return patches

    const previous = previousLookup.get(playerKey) || {}
    const patch = {
      playerKey,
      statsStatus: clean(player.statsStatus),
      playerStats: clone(player.playerStats || {}),
      lineClassification: player.lineClassification || null,
      ...buildTeamPlayerScoutProjection(player),
    }

    const comparablePrevious = {
      playerKey,
      statsStatus: clean(previous.statsStatus),
      playerStats: clone(previous.playerStats || {}),
      lineClassification: previous.lineClassification || null,
      ...buildTeamPlayerScoutProjection(previous),
    }

    if (!sameValue(patch, comparablePrevious)) {
      patches.push(patch)
    }

    return patches
  }, [])
}

export const buildFinalStatsTeamSeasonState = ({
  canonical = {},
  season = {},
  team = {},
  incomingPlayers = [],
  reloadDecisionState = null,
  movementState = null,
  statsLoadState = {},
} = {}) => {
  const currentSeason = isObject(canonical.teamSeason)
    ? canonical.teamSeason
    : null

  if (!currentSeason) {
    const error = new Error('Canonical Team Season is required')
    error.code = 'STATS_TEAM_SEASON_NOT_FOUND'
    throw error
  }

  const seasonStatus = resolveLeagueSeasonStatus({
    league: canonical.league,
    season: {
      ...season,
      seasonKey: season.seasonKey || currentSeason.seasonKey,
    },
  })

  if (seasonStatus !== 'active' && seasonStatus !== 'completed') {
    const error = new Error('League season lifecycle could not be resolved')
    error.code = 'STATS_SEASON_STATUS_UNRESOLVED'
    throw error
  }

  const effectiveSeason = {
    ...season,
    seasonId: season.seasonId || currentSeason.seasonId,
    seasonKey: season.seasonKey || currentSeason.seasonKey,
    seasonStatus,
  }
  const effectiveTeam = {
    ...team,
    birthTeamDocumentId: team.birthTeamDocumentId || canonical.teamRoot?.id,
    teamDocumentId: team.teamDocumentId || canonical.teamRoot?.id,
  }
  const canonicalPerformance = buildLeagueTeamPerformanceProjection({
    league: canonical.league,
    season: effectiveSeason,
    target: seasonStatus === 'completed' ? 'history' : 'current',
    team: effectiveTeam,
  })

  if (!canonicalPerformance) {
    const error = new Error('Canonical Team Performance could not be resolved from League')
    error.code = 'STATS_TEAM_PERFORMANCE_UNRESOLVED'
    throw error
  }
  const canonicalTeamScout = resolveCanonicalTeamScout({
    league: canonical.league,
    season: effectiveSeason,
    team: effectiveTeam,
  })

  const mergedPlayers = mergeResolvedPlayers({
    existingPlayers: currentSeason.teamPlayers,
    incomingPlayers,
    reloadDecisionState,
  })
  const scoutedPlayers = mergedPlayers.map(player => buildScoutedPlayer({
    player,
    team: effectiveTeam,
    season: effectiveSeason,
  }))
  const scoutProfilesSummary = buildScoutProfilesSummary(scoutedPlayers)
  const seasonBeforeBalance = {
    ...currentSeason,
    seasonStatus,
    tableRank: canonicalPerformance.tableRank,
    tableAttackRank: canonicalPerformance.tableAttackRank,
    tableDefenseRank: canonicalPerformance.tableDefenseRank,
    goalsForPerGame: canonicalPerformance.goalsForPerGame,
    goalsAgainstPerGame: canonicalPerformance.goalsAgainstPerGame,
    teamStats: {
      ...(currentSeason.teamStats || {}),
      teamGamePlayed: canonicalPerformance.teamGamePlayed,
      goalsFor: canonicalPerformance.goalsFor,
      goalsAgainst: canonicalPerformance.goalsAgainst,
    },
    performance: canonicalTeamScout,
    teamAttackPerformance: canonicalTeamScout.offense,
    teamDefensePerformance: canonicalTeamScout.defense,
    teamPlayers: scoutedPlayers,
    playersCount: countCurrentRosterPlayers(scoutedPlayers),
    scoutProfilesSummary,
    ...(movementState ? {
      transfersIn: Array.isArray(movementState.transfersIn) ? movementState.transfersIn : [],
      transfersOut: Array.isArray(movementState.transfersOut) ? movementState.transfersOut : [],
      pendingPlayers: Array.isArray(movementState.pendingPlayers) ? movementState.pendingPlayers : [],
    } : {}),
  }
  const teamBalance = buildTeamBalanceState({
    teamDocument: effectiveTeam,
    seasonDocument: seasonBeforeBalance,
  })
  const finalTeamSeasonPreview = {
    ...seasonBeforeBalance,
    teamBalance,
    teamScout: canonicalTeamScout,
  }
  const playerOwnedPatches = buildPlayerOwnedPatches({
    previousPlayers: currentSeason.teamPlayers,
    nextPlayers: scoutedPlayers,
  })
  const teamScout = canonicalTeamScout

  return {
    seasonStatus,
    playerOwnedPatches,
    approvedNewParticipants: scoutedPlayers.filter(player => {
      const playerKey = resolveStatsPlayerIdentityKey(player)
      return !((currentSeason.teamPlayers || []).some(existing => (
        resolveStatsPlayerIdentityKey(existing) === playerKey
      )))
    }),
    localMovementPatch: movementState ? {
      transfersIn: Array.isArray(movementState.transfersIn) ? movementState.transfersIn : [],
      transfersOut: Array.isArray(movementState.transfersOut) ? movementState.transfersOut : [],
      pendingPlayers: Array.isArray(movementState.pendingPlayers) ? movementState.pendingPlayers : [],
    } : null,
    playersCount: finalTeamSeasonPreview.playersCount,
    teamBalance,
    teamScout,
    scoutProfilesSummary,
    statsLoadState: clone(statsLoadState),
    finalTeamSeasonPreview,
  }
}
