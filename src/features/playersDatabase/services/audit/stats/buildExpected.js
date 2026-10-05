// src/features/playersDatabase/services/audit/stats/buildExpected.js

import {
  buildPlayerSearchIndexProjection,
  buildPlayerSeasonProjection,
  buildStatsCenterProjections,
} from '../../../domain/stats/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})

export const buildStatsAuditExpected = ({ actual = {}, approvedState = null, seasonId = '' } = {}) => {
  const teamSeason = actual.teamSeason
  const league = actual.league
  const clubDirectoryEntry = actual.clubDirectoryEntry
  if (!teamSeason || !league) {
    return {
      complete: false,
      reason: !teamSeason
        ? 'missing_team_season'
        : 'missing_league',
      expected: null,
    }
  }

  const identity = object(teamSeason.identity)
  const teamId = clean(identity.teamId)
  const leagueId = clean(identity.leagueId)
  const clubId = clean(identity.clubId)
  const playerIds = Array.from(new Set([
    ...Object.keys(object(object(teamSeason.roster).playersById)),
    ...(approvedState && Array.isArray(approvedState.playerRootPlans)
      ? approvedState.playerRootPlans.map(plan => plan.playerId)
      : []),
    ...(approvedState && Array.isArray(approvedState.playerSeasonPlans)
      ? approvedState.playerSeasonPlans.map(plan => plan.playerId)
      : []),
    ...(approvedState && Array.isArray(approvedState.playerSearchIndexPlans)
      ? approvedState.playerSearchIndexPlans.map(plan => plan.playerId)
      : []),
  ].map(clean).filter(Boolean)))
  const leagueCenterTeam = object(
    object(
      object(
        object(actual.leaguesCenter).leaguesById
      )[leagueId]
    ).seasonsById
  )[seasonId]
  const previousLeaguesCenterTeam = object(object(leagueCenterTeam).teamsById)[teamId] || null
  const previousClubsCenterTeam = object(
    object(
      object(object(actual.clubsCenter).clubsById)[clubId]
    ).teamsById
  )[teamId] || null
  const updatedAt = approvedState && approvedState.updatedAt
    ? approvedState.updatedAt
    : object(teamSeason.stats).updatedAt || null
  const center = buildStatsCenterProjections({
    teamSeason,
    league,
    clubDirectoryEntry,
    seasonId,
    previousLeaguesCenterTeam,
    previousClubsCenterTeam,
    updatedAt,
  })

  const playerSeasonsById = {}
  const playerSearchIndexesById = {}
  playerIds.forEach(playerId => {
    const playerRoot = object(actual.playerRootsById)[playerId] || null
    playerSeasonsById[playerId] = buildPlayerSeasonProjection({
      playerId,
      playerRoot,
      teamSeason,
      league,
      seasonId,
      updatedAt,
    })
    playerSearchIndexesById[playerId] = buildPlayerSearchIndexProjection({
      playerId,
      playerRoot,
      teamSeason,
      league,
      clubDirectoryEntry,
      seasonId,
      updatedAt,
    })
  })

  const stats = object(teamSeason.stats)
  const scouting = object(teamSeason.scouting)
  const teamTaskSignals = object(teamSeason.teamTaskSignals)
  const playersWithScoutProfileCount = Object.values(object(scouting.playersById))
    .filter(player => Array.isArray(player && player.professionalProfileIds) && player.professionalProfileIds.length > 0)
    .length

  return {
    complete: true,
    reason: '',
    expected: {
      canonicalTeamSeason: approvedState && approvedState.canonicalTeamSeason
        ? approvedState.canonicalTeamSeason
        : null,
      playerRootPlans: approvedState && Array.isArray(approvedState.playerRootPlans)
        ? approvedState.playerRootPlans
        : [],
      counterpartPatches: approvedState && Array.isArray(approvedState.counterpartPatches)
        ? approvedState.counterpartPatches
        : [],
      playerSeasonsById,
      playerSearchIndexesById,
      leagueTeamPatch: {
        stats: {
          hasStats: Object.values(object(stats.playersById)).some(player => clean(player && player.statsStatus) === 'loaded'),
          statsComplete: clean(object(stats.statsLoadState).status) === 'loaded',
        },
        scouting: {
          playersWithScoutProfileCount,
          teamTaskSignals: {
            offense: Boolean(teamTaskSignals.offense),
            defense: Boolean(teamTaskSignals.defense),
            updatedAt: teamTaskSignals.updatedAt || null,
          },
        },
        updatedAt,
      },
      leaguesCenterTeam: center.leaguesCenterTeam,
      clubsCenterTeam: center.clubsCenterTeam,
    },
  }
}
