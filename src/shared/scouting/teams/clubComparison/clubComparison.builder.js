// src/shared/scouting/teams/clubComparison/clubComparison.builder.js

import { CLUB_COMPARISON_METRICS, CLUB_COMPARISON_VERSION, clubComparisonSeasonOrder, comparisonNumber } from './clubComparison.model.js'
import { TEAM_SIGNAL_CALIBRATION } from '../signals/teamSignalCalibration.js'
import { evaluateClubComparisonMetric } from './clubComparison.benchmark.js'

export const buildClubCohortComparison = ({ teams = [], clubId, seasonId } = {}) => {
  const selectedOrder = clubComparisonSeasonOrder(seasonId)
  const scoped = teams.filter(team => team.clubId === clubId && team.teamId &&
    selectedOrder !== null && clubComparisonSeasonOrder(team.seasonId) !== null &&
    clubComparisonSeasonOrder(team.seasonId) <= selectedOrder)
  const rows = [...new Map(scoped.map(team => [`${team.teamId}:${team.seasonId}`, team])).values()]
    .map(team => ({
      ...team,
      birthYear: comparisonNumber(team.birthYear),
      teamSlot: comparisonNumber(team.teamSlot),
      games: comparisonNumber(team.games),
      rosterCount: comparisonNumber(team.rosterCount),
      ...Object.fromEntries(CLUB_COMPARISON_METRICS.map(metric => [metric.key, comparisonNumber(team[metric.key])])),
    })).filter(row => row.teamSlot === 1 && row.birthYear > 0)
  const counts = new Map()
  rows.forEach(row => {
    const key = `${row.birthYear}:${row.seasonId}`
    counts.set(key, (counts.get(key) || 0) + 1)
  })
  rows.forEach(row => { row.ambiguous = counts.get(`${row.birthYear}:${row.seasonId}`) > 1 })
  return {
    version: CLUB_COMPARISON_VERSION,
    clubId,
    seasonId,
    referenceRows: rows.filter(row => row.seasonId !== seasonId)
      .sort((a, b) => b.seasonId.localeCompare(a.seasonId) || b.birthYear - a.birthYear),
    rows: rows.filter(row => row.seasonId === seasonId).map(row => {
      const metrics = CLUB_COMPARISON_METRICS.map(metric => evaluateClubComparisonMetric(row, rows, metric))
      const findings = metrics.filter(metric => metric.isAnomaly)
      const families = [...new Set(findings.map(metric => metric.family))]
      const availableCount = metrics.filter(metric => metric.availability === 'available').length
      const availability = availableCount === metrics.length ? 'available' : availableCount ? 'partial' : 'unavailable'
      return {
        ...row, metrics: Object.fromEntries(metrics.map(metric => [metric.key, metric])), findings, families,
        availableCount, availability,
        signalLevel: families.includes('competition') ? 2 : (families.length >= TEAM_SIGNAL_CALIBRATION.clubComparison.strongFamilyCount ? 2 : families.length ? 1 : 0),
        status: families.includes('competition') || families.length >= TEAM_SIGNAL_CALIBRATION.clubComparison.strongFamilyCount ? 'multiple' : families.length === 1 ? 'single'
          : availability === 'available' ? 'none' : 'limited',
      }
    }).sort((a, b) => b.birthYear - a.birthYear),
  }
}
