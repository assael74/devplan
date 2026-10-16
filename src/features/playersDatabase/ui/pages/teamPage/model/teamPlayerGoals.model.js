// src/features/playersDatabase/ui/pages/teamPage/model/teamPlayerGoals.model.js

import { buildPlayerScoutNormalization } from '@devplan/players-scout-engine/players/normalization.js'
import { numberOrNull } from './teamInformation.utils.js'

export const buildTeamPlayerGoalProjection = ({ player, goals, season } = {}) => {
  const actualGoals = numberOrNull(goals)
  const unavailable = { projectedGoals: null, comparisonGoals: null }
  if (actualGoals === null) return unavailable
  const playerId = player?.playerId || player?.playerDocumentId || player?.id
  const evidence = season?.scouting?.playersById?.[playerId]?.evidence || player?.scoutSeasonProjection?.evidence
  const calculation = evidence?.calculationContext
  const seasonStatus = calculation?.seasonStatus || season?.seasonStatus
  if (seasonStatus === 'completed') return { ...unavailable, comparisonGoals: actualGoals }
  const teamGamePlayed = numberOrNull(calculation?.teamGamePlayed)
  const leagueTotalRound = numberOrNull(calculation?.leagueTotalRound)
  if (seasonStatus !== 'active' || !(teamGamePlayed > 0) || !(leagueTotalRound > 0) ||
    numberOrNull(evidence?.actual?.goals) !== actualGoals) return unavailable

  // Use the same captured inputs as the professional profile, never a newer
  // league snapshot or an assumed season length.
  const normalization = buildPlayerScoutNormalization({
    player: evidence.actual,
    team: { teamGamePlayed },
    season: { seasonStatus, leagueTotalRound },
  })
  return {
    projectedGoals: normalization.applied ? normalization.projectedStats.goals : null,
    comparisonGoals: normalization.projectedStats.goals,
  }
}
