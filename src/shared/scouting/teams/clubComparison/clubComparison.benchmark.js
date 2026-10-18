// src/shared/scouting/teams/clubComparison/clubComparison.benchmark.js

import { CLUB_COMPARISON_MIN_PEERS, CLUB_COMPARISON_MIN_REFERENCE_GAMES, clubComparisonSeasonOrder, comparisonNumber } from './clubComparison.model.js'

const median = values => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

export const metricUnavailableReason = (row, metric, minGames = metric.minGames) => {
  if (row.ambiguous) return 'ambiguous_cohort'
  if (row.teamSlot !== 1) return 'not_primary'
  if (metric.minGames && row.seasonStatus === 'not_started') return 'season_not_started'
  if (metric.minGames && row.games === null) return 'missing_games'
  if (metric.minGames && !(row.games >= minGames)) {
    return 'insufficient_games'
  }
  if (metric.key === 'leagueLevel' && !(row.leagueLevel > 0)) return 'missing_league_level'
  if (metric.sameLeagueLevel && !(row.leagueLevel > 0)) return 'missing_league_level'
  if (metric.minPlayerGap && (!row.profilesAvailable || !(row.rosterCount > 0))) return 'profiles_unavailable'
  return comparisonNumber(row[metric.key]) === null ? 'missing_value' : null
}

export const evaluateClubComparisonMetric = (target, rows, metric) => {
  const reason = metricUnavailableReason(target, metric)
  const peers = rows.filter(row => (
    row.clubId === target.clubId &&
    clubComparisonSeasonOrder(row.seasonId) < clubComparisonSeasonOrder(target.seasonId) &&
    !metricUnavailableReason(row, metric, metric.minGames ? CLUB_COMPARISON_MIN_REFERENCE_GAMES : 0) &&
    (!metric.sameLeagueLevel || row.leagueLevel === target.leagueLevel)
  ))
  const cohortCount = new Set(peers.map(row => row.birthYear)).size
  const seasonIds = [...new Set(peers.map(row => row.seasonId))].sort().reverse()
  const available = !reason && cohortCount >= CLUB_COMPARISON_MIN_PEERS
  const reference = available ? median(peers.map(row => row[metric.key])) : null
  const delta = available ? target[metric.key] - reference : null
  const playerGap = available && metric.minPlayerGap ? Math.abs(delta) * target.rosterCount / 100 : null
  const isAnomaly = available && Math.abs(delta) + 1e-9 >= metric.threshold &&
    (!metric.minPlayerGap || playerGap + 1e-9 >= metric.minPlayerGap)
  return {
    key: metric.key, family: metric.family, value: target[metric.key], reference, delta,
    peerCount: peers.length, cohortCount, seasonIds,
    peerTeamIds: peers.map(row => row.teamId),
    referenceKeys: peers.map(row => `${row.teamId}:${row.seasonId}`), playerGap,
    availability: available ? 'available' : 'unavailable',
    reason: available ? null : reason || 'insufficient_peers',
    isAnomaly, isEarlySample: available && metric.family === 'performance' && target.games < CLUB_COMPARISON_MIN_REFERENCE_GAMES,
    direction: available ? delta > 0 ? 'above' : delta < 0 ? 'below' : 'equal' : null,
  }
}
