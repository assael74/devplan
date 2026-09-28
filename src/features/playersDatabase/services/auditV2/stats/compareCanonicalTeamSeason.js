// src/features/playersDatabase/services/auditV2/stats/compareCanonicalTeamSeason.js

import { getTeamSeasonStatsState } from '../../../domain/statsV2/teamSeasonStatsState.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export function compareStatsCanonicalTeamSeasonV2({ canonical = {} } = {}) {
  const teamSeason = canonical.teamSeason || {}
  const players = Array.isArray(teamSeason.teamPlayers)
    ? teamSeason.teamPlayers
    : []
  const statsLoadStatus = clean(teamSeason.statsLoadState?.status)
  if (statsLoadStatus === 'missing') {
    return getTeamSeasonStatsState(teamSeason) === 'absent'
      ? []
      : [{
        type: 'canonical_invariant_mismatch',
        target: 'teamSeason',
        documentId: clean(teamSeason.id),
        reason: 'Stats are marked missing but canonical Stats or scouting residues remain.',
        expected: { statsState: 'absent' },
        actual: { statsState: 'present' },
      }]
  }

  const loadedPlayers = players.filter(player => (
    clean(player?.statsStatus) === 'loaded'
  ))

  if (statsLoadStatus !== 'loaded' || !players.length || loadedPlayers.length) {
    return []
  }

  return [{
    type: 'canonical_invariant_mismatch',
    target: 'teamSeason',
    documentId: clean(teamSeason.id),
    reason: 'Stats load is marked as loaded but no Team Season player is marked as loaded.',
    expected: {
      statsLoadStatus: 'loaded',
      loadedPlayers: 'at_least_one',
    },
    actual: {
      statsLoadStatus,
      playersCount: players.length,
      loadedPlayers: 0,
    },
  }]
}
