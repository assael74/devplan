// src/features/playersDatabase/domain/clubIntelligence/clubCompetitionPath.builder.js

import { buildYouthFutureCompetitionPath } from '../../../../shared/scouting/common/futureCompetition/futureCompetitionPath.js'
import { normalizeClubCompetitionStatus } from '../contracts/club.contract.js'

export const buildClubCompetitionPath = (team, teams) => {
  const candidates = teams.filter(source => (
    Number(source.birthYear) === Number(team.birthYear) - 1 &&
    Number(source.teamSlot) === Number(team.teamSlot) &&
    source.seasonId === team.seasonId
  ))
  const source = candidates.length === 1 && Number(team.teamSlot) > 0 ? candidates[0] : null
  const projection = source?.competitionProjection?.effective
  const status = normalizeClubCompetitionStatus(projection?.status)
  const path = buildYouthFutureCompetitionPath({
    birthYear: team.birthYear,
    birthTeamSlot: team.teamSlot,
    seasonKey: team.seasonKey,
    leagueLevel: team.league?.leagueLevel,
    yearsAhead: 1,
    clubBirthTeams: source ? [{
      birthYear: source.birthYear,
      teamSlot: source.teamSlot,
      projectedLeagueLevel: projection?.projectedNextLeagueLevel,
    }] : [],
  })
  const step = path.steps[0]
  const available = Boolean(source && step?.leagueLevel &&
    !['UNKNOWN', 'CURRENT_LEVEL'].includes(status) && source.seasonStatus !== 'not_started')
  const reason = !source ? candidates.length > 1 ? 'SOURCE_AMBIGUOUS' : 'SOURCE_MISSING'
    : status === 'CURRENT_LEVEL' ? 'SOURCE_CURRENT_LEVEL_ONLY'
      : !available ? 'SOURCE_FORECAST_UNAVAILABLE' : null

  return {
    sourceBirthYear: source?.birthYear || Number(team.birthYear) - 1,
    sourceTeamId: source?.teamId || null,
    sourceTeamSlot: source?.teamSlot || null,
    currentLeagueLevel: path.current.leagueLevel,
    projectedNextLeagueLevel: available ? step.leagueLevel : null,
    seasonKey: step?.seasonKey || '',
    direction: available ? step.directionFromCurrent : 'unknown',
    status,
    source: projection?.source || 'AUTOMATIC',
    reason,
    unavailableReasons: available ? [] : source?.competitionUnavailableReasons || [],
    availability: { availability: available ? 'available' : 'unavailable', reason },
  }
}
