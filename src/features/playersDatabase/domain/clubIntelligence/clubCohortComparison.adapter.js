// src/features/playersDatabase/domain/clubIntelligence/clubCohortComparison.adapter.js

import { buildClubCohortComparison, CLUB_COMPARISON_PRIORITY_LEVELS, comparisonNumber } from '../../../../shared/scouting/teams/clubComparison/index.js'
import { buildScoutProfileGroupCounts } from '../../model/scout/scoutProfilesSummary.model.js'
import { isCurrentRosterPlayer } from '../../model/team/rosterStatus.model.js'

const priority = value => {
  const index = CLUB_COMPARISON_PRIORITY_LEVELS.indexOf(value)
  return index < 0 ? null : index
}

const adaptSeasonTeams = ({
  clubId,
  seasonId,
  center,
  leaguesById = {},
  teamSeasonsById = {},
}) => {
  const teams = Object.entries(center?.clubsById?.[clubId]?.teamsById || {}).map(([teamId, entry]) => {
    const league = leaguesById[entry.leagueId]
    const leagueSeason = league?.seasonsById?.[seasonId]
    const officialRow = leagueSeason?.table?.teamsById?.[teamId]
    const official = officialRow?.officialTable
    const season = teamSeasonsById[teamId]
    const validSeason = season?.identity?.teamId === teamId && season?.identity?.clubId === clubId &&
      season?.identity?.seasonId === seasonId ? season : null
    const roster = validSeason?.roster?.playersById
    const scouting = validSeason?.scouting?.playersById
    const statsPlayers = validSeason?.stats?.playersById
    const players = Object.entries(roster || {}).map(([playerId, player]) => ({
      ...player, playerId,
      professionalScoutProfileIds: statsPlayers?.[playerId]?.statsStatus === 'loaded'
        ? scouting?.[playerId]?.professionalProfileIds || [] : [],
    })).filter(isCurrentRosterPlayer)
    const analyzedPlayers = players.filter(player => statsPlayers?.[player.playerId]?.statsStatus === 'loaded')
    // Stats Load creates scouting only for loaded participants. Roster-only
    // players still belong in the denominator, without a recognized profile.
    const profilesAvailable = Boolean(roster && players.length && scouting && statsPlayers &&
      validSeason?.stats?.statsLoadState?.status === 'loaded' &&
      analyzedPlayers.every(player => Array.isArray(scouting[player.playerId]?.professionalProfileIds)))
    const counts = profilesAvailable ? buildScoutProfileGroupCounts(players) : null
    const games = comparisonNumber(official?.teamGamePlayed)
    const points = comparisonNumber(official?.points)
    const rank = comparisonNumber(official?.rank)
    const leagueTeamCount = Object.keys(leagueSeason?.table?.teamsById || {}).length
    const goalsFor = comparisonNumber(official?.goalsFor)
    const goalsAgainst = comparisonNumber(official?.goalsAgainst)
    return {
      teamId, clubId, seasonId, birthYear: entry.birthYear, teamSlot: entry.teamSlot,
      ageGroup: league?.ageGroupLabel || center?.leaguesById?.[entry.leagueId]?.ageGroupLabel || '',
      leagueName: league?.names?.display || league?.names?.official || center?.leaguesById?.[entry.leagueId]?.displayName || '',
      leagueLevel: officialRow ? comparisonNumber(league?.level) : null,
      seasonStatus: leagueSeason?.seasonStatus || '',
      games,
      rank,
      leagueTeamCount,
      rankPercentile: Number.isInteger(rank) && rank >= 1 && rank <= leagueTeamCount && leagueTeamCount > 1
        ? (rank - 1) / (leagueTeamCount - 1) * 100 : null,
      successRate: games > 0 && points !== null ? points / (games * 3) * 100 : null,
      goalsForPerGame: games > 0 && goalsFor !== null ? goalsFor / games : null,
      goalsAgainstPerGame: games > 0 && goalsAgainst !== null ? goalsAgainst / games : null,
      offense: official ? priority(officialRow?.performance?.offense?.priorityLevel) : null,
      defense: official ? priority(officialRow?.performance?.defense?.priorityLevel) : null,
      offenseScore: official ? comparisonNumber(officialRow?.performance?.offense?.scoutPriorityScore) : null,
      defenseScore: official ? comparisonNumber(officialRow?.performance?.defense?.scoutPriorityScore) : null,
      rosterCount: roster ? players.length : null,
      analyzedCount: profilesAvailable ? analyzedPlayers.length : null,
      profilesAvailable,
      professionalCount: counts?.professional,
      underuseCount: counts?.underuse,
      professionalRate: counts ? counts.professional / players.length * 100 : null,
      underuseRate: counts ? counts.underuse / players.length * 100 : null,
    }
  })
  return teams
}

export const adaptClubCohortComparison = ({
  clubId,
  seasonId,
  center,
  leaguesById = {},
  teamSeasonsById = {},
  history = [],
  unavailableSeasonIds = [],
}) => ({
  ...buildClubCohortComparison({
    clubId, seasonId,
    teams: [
      ...adaptSeasonTeams({ clubId, seasonId, center, leaguesById, teamSeasonsById }),
      ...history.flatMap(source => adaptSeasonTeams({ ...source, clubId, leaguesById })),
    ],
  }),
  unavailableSeasonIds,
})
