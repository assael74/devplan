// src/features/playersDatabase/domain/statsV2/teamSeasonStatsState.js

import {
  STATS_OWNED_RICH_SCOUT_FIELDS,
  buildStatsAbsentTeamSeasonState,
} from './statsAbsence.builder.js'

const sortValue = value => {
  if (Array.isArray(value)) {
    return value.map(sortValue)
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  return Object.keys(value)
    .sort()
    .reduce((result, key) => ({
      ...result,
      [key]: sortValue(value[key]),
    }), {})
}

const sameValue = (left, right) => (
  JSON.stringify(sortValue(left)) === JSON.stringify(sortValue(right))
)

const pickRichScoutState = player => STATS_OWNED_RICH_SCOUT_FIELDS.reduce(
  (result, field) => ({
    ...result,
    [field]: player?.[field],
  }),
  {}
)

const pickStatsOwnedState = teamSeason => ({
  teamPlayers: (Array.isArray(teamSeason?.teamPlayers) ? teamSeason.teamPlayers : [])
    .map(player => ({
      statsStatus: player?.statsStatus,
      playerStats: player?.playerStats,
      lineClassification: player?.lineClassification,
      ...pickRichScoutState(player),
      primaryScoutProfileId: player?.primaryScoutProfileId,
      primaryScoutProfileStrengthDepthPct: player?.primaryScoutProfileStrengthDepthPct,
      professionalScoutProfileIds: player?.professionalScoutProfileIds,
      preliminaryScoutProfileIds: player?.preliminaryScoutProfileIds,
      scoutEffectiveImmediacyStatus: player?.scoutEffectiveImmediacyStatus,
      scoutPlayerInterestLevel: player?.scoutPlayerInterestLevel,
      scoutEngineVersion: player?.scoutEngineVersion,
    })),
  teamBalance: teamSeason?.teamBalance,
  scoutProfilesSummary: teamSeason?.scoutProfilesSummary,
  statsLoadState: teamSeason?.statsLoadState,
})

export const getTeamSeasonStatsState = (teamSeason = {}) => {
  const expected = buildStatsAbsentTeamSeasonState(teamSeason)

  return sameValue(
    pickStatsOwnedState(teamSeason),
    pickStatsOwnedState(expected)
  )
    ? 'absent'
    : 'present'
}
