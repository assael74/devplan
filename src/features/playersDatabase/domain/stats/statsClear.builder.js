// src/features/playersDatabase/domain/stats/statsClear.builder.js

import {
  buildPlayerSeasonDocumentId,
  buildTeamSeasonDocumentId,
  requireSeasonId,
} from '../identity/index.js'
import {
  buildPlayerSearchIndexProjection,
  buildPlayerSeasonProjection,
  buildStatsCenterProjections,
} from './statsProjection.builder.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})
const requireSource = (value, code, message) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    const error = new Error(message)
    error.code = code
    throw error
  }
  return value
}

const hasValues = value => Object.keys(object(value)).length > 0

const statsArePresent = teamSeason => {
  const stats = object(teamSeason.stats)
  const scouting = object(teamSeason.scouting)
  return Boolean(
    clean(object(stats.statsLoadState).status) === 'loaded' ||
    Object.values(object(stats.playersById)).some(player => clean(player && player.statsStatus) === 'loaded') ||
    hasValues(stats.teamBalance) ||
    hasValues(scouting.playersById) ||
    hasValues(scouting.scoutProfilesSummary)
  )
}

const requireCanonicalSources = ({ leagueId, teamId, seasonId, sources }) => {
  const teamRoot = requireSource(sources.teamRoot, 'STATS_CLEAR_TEAM_ROOT_NOT_FOUND', 'Canonical Team Root is required for Stats Clear')
  const teamSeason = requireSource(sources.teamSeason, 'STATS_CLEAR_TEAM_SEASON_NOT_FOUND', 'Canonical Team Season is required for Stats Clear')
  const league = requireSource(sources.league, 'STATS_CLEAR_LEAGUE_NOT_FOUND', 'Canonical League is required for Stats Clear')
  const identity = object(teamSeason.identity)
  const rootIdentity = object(teamRoot.identity)
  const teamSeasonDocumentId = buildTeamSeasonDocumentId({ teamId, seasonId })

  if (
    clean(teamRoot.id || rootIdentity.teamId) !== teamId ||
    clean(rootIdentity.teamId) !== teamId ||
    clean(teamSeason.id || identity.teamSeasonDocumentId) !== teamSeasonDocumentId ||
    clean(identity.teamId) !== teamId ||
    clean(identity.seasonId) !== seasonId ||
    clean(identity.leagueId) !== leagueId ||
    clean(league.id || league.leagueId) !== leagueId
  ) {
    const error = new Error('Stats Clear canonical identity mismatch')
    error.code = 'STATS_CLEAR_IDENTITY_MISMATCH'
    throw error
  }

  return { teamSeason, league, identity, teamSeasonDocumentId }
}

export const buildStatsClearApprovedState = ({
  leagueId = '',
  teamId = '',
  seasonId = '',
  updatedAt = null,
  sources = {},
} = {}) => {
  const resolvedLeagueId = clean(leagueId)
  const resolvedTeamId = clean(teamId)
  const resolvedSeasonId = requireSeasonId(seasonId)
  if (!resolvedLeagueId || !resolvedTeamId) throw new Error('Missing Stats Clear target identity')

  const {
    teamSeason: existingTeamSeason,
    league,
    identity,
    teamSeasonDocumentId,
  } = requireCanonicalSources({
    leagueId: resolvedLeagueId,
    teamId: resolvedTeamId,
    seasonId: resolvedSeasonId,
    sources,
  })
  const rosterPlayersById = object(object(existingTeamSeason.roster).playersById)
  const statsPlayersById = object(object(existingTeamSeason.stats).playersById)
  const scoutingPlayersById = object(object(existingTeamSeason.scouting).playersById)
  const playerIds = Array.from(new Set([
    ...Object.keys(rosterPlayersById),
    ...Object.keys(statsPlayersById),
    ...Object.keys(scoutingPlayersById),
    ...Object.keys(object(sources.playerSeasonsById)),
    ...Object.keys(object(sources.playerSearchIndexesById)),
  ].map(clean).filter(Boolean)))
  const currentStatsState = statsArePresent(existingTeamSeason) ? 'present' : 'absent'
  const canonicalTeamSeason = {
    ...existingTeamSeason,
    stats: {
      playersById: {},
      teamBalance: {},
      statsLoadState: { status: 'missing', updatedAt: updatedAt || null },
      updatedAt: updatedAt || null,
    },
    scouting: {
      playersById: {},
      scoutProfilesSummary: {},
      updatedAt: updatedAt || null,
    },
    teamTaskSignals: { offense: false, defense: false, updatedAt: updatedAt || null },
    teamTaskAvailability: { availability: '', reason: '' },
    timestamps: {
      ...object(existingTeamSeason.timestamps),
      updatedAt: updatedAt || null,
    },
  }

  // Clear Stats owns no Player Root fields. Identity, long-lived manual data
  // and season navigation remain intact while seasonal projections are reset.
  const playerRootPlans = []
  const effectivePlayerRootsById = { ...object(sources.playerRootsById) }

  const playerSeasonPlans = playerIds.map(playerId => ({
    playerId,
    documentId: buildPlayerSeasonDocumentId({ playerId, seasonId: resolvedSeasonId }),
    exists: Boolean(object(sources.playerSeasonsById)[playerId]),
    teamExists: Boolean(
      object(object(object(sources.playerSeasonsById)[playerId]).teamsById)[resolvedTeamId]
    ),
    projection: buildPlayerSeasonProjection({
      playerId,
      playerRoot: effectivePlayerRootsById[playerId] || null,
      teamSeason: canonicalTeamSeason,
      league,
      seasonId: resolvedSeasonId,
      updatedAt,
    }),
  }))
  const playerSearchIndexPlans = playerIds.map(playerId => ({
    playerId,
    exists: Boolean(object(sources.playerSearchIndexesById)[playerId]),
    projection: buildPlayerSearchIndexProjection({
      playerId,
      playerRoot: effectivePlayerRootsById[playerId] || null,
      teamSeason: canonicalTeamSeason,
      league,
      seasonId: resolvedSeasonId,
      updatedAt,
    }),
  }))
  const center = buildStatsCenterProjections({
    teamSeason: canonicalTeamSeason,
    league,
    seasonId: resolvedSeasonId,
    previousLeaguesCenterTeam: sources.previousLeaguesCenterTeam || null,
    previousClubsCenterTeam: sources.previousClubsCenterTeam || null,
    updatedAt,
  })
  const leagueTeamPatch = {
    stats: { hasStats: false, statsComplete: false },
    scouting: {
      playersWithScoutProfileCount: 0,
      teamTaskSignals: canonicalTeamSeason.teamTaskSignals,
    },
    updatedAt: updatedAt || null,
  }

  return {
    actionType: 'statsClear',
    teamId: resolvedTeamId,
    seasonId: resolvedSeasonId,
    leagueId: resolvedLeagueId,
    clubId: clean(identity.clubId),
    teamSeasonDocumentId,
    updatedAt: updatedAt || null,
    currentStatsState,
    isIdempotent: currentStatsState === 'absent',
    canonicalTeamSeason,
    playerRootPlans,
    playerSeasonPlans,
    playerSearchIndexPlans,
    leagueProjection: {
      leagueId: resolvedLeagueId,
      seasonId: resolvedSeasonId,
      teamId: resolvedTeamId,
      patch: leagueTeamPatch,
    },
    leaguesCenterProjection: {
      leagueId: resolvedLeagueId,
      seasonId: resolvedSeasonId,
      teamId: resolvedTeamId,
      team: center.leaguesCenterTeam,
      updatedAt: updatedAt || null,
    },
    clubsCenterProjection: {
      seasonId: resolvedSeasonId,
      leagueId: resolvedLeagueId,
      clubId: clean(identity.clubId),
      teamId: resolvedTeamId,
      team: center.clubsCenterTeam,
      updatedAt: updatedAt || null,
    },
    identity: {
      teamId: resolvedTeamId,
      teamSeasonDocumentId,
      seasonId: resolvedSeasonId,
      seasonKey: clean(identity.seasonKey),
      leagueId: resolvedLeagueId,
      clubId: clean(identity.clubId),
    },
    impact: {
      playersAffected: currentStatsState === 'present' ? playerIds.length : 0,
      scoutProfilePlayersAffected: currentStatsState === 'present'
        ? Object.keys(object(object(existingTeamSeason.scouting).playersById)).length
        : 0,
      playerRootsDeleted: 0,
    },
    projectionPlan: {
      impact: {
        operationsRequired: playerRootPlans.length + playerSeasonPlans.length + playerSearchIndexPlans.length + 3,
      },
    },
    sourceSummary: {
      seasonKey: clean(identity.seasonKey),
      rosterPlayersCount: playerIds.length,
    },
  }
}
