// src/features/playersDatabase/ui/pages/teamPage/information/model/teamFutureCompetition.model.js

import { calculateSuccessPercent, numberOrNull } from '../../model/teamInformation.utils.js'
import { normalizeClubCompetitionStatus } from '../../../../../domain/contracts/club.contract.js'
import { buildTeamPerformanceInsight } from './teamPerformanceInsight.model.js'

const STATUS_PRESENTATION = {
  UNKNOWN: { label: 'צפי טרם זמין', color: 'neutral' },
  CURRENT_LEVEL: { label: 'רמה נוכחית בלבד', color: 'neutral' },
  STABLE: { label: 'ללא שינוי צפוי', color: 'neutral' },
  PROMOTION_POSSIBLE: { label: 'אפשרות לעלייה', color: 'success' },
  RELEGATION_RISK: { label: 'סיכון לירידה', color: 'warning' },
  SAFE_CONFIRMED: { label: 'הישארות הובטחה', color: 'success' },
  PROMOTED_CONFIRMED: { label: 'עלייה הובטחה', color: 'success' },
  RELEGATED_CONFIRMED: { label: 'ירידה נקבעה', color: 'danger' },
}

export const buildOlderYearTeamRows = (groups = [], details = {}) => groups.flatMap(group => {
  const teams = group.seasons?.current?.teams || []
  return (teams.length ? teams : [null]).map(team => {
    const projection = team?.competitionProjection?.effective
    const status = normalizeClubCompetitionStatus(projection?.status)
    const official = details.leaguesById?.[team?.league?.leagueId]
      ?.seasonsById?.[team?.seasonId]?.table?.teamsById?.[team?.teamId]?.officialTable
    const games = numberOrNull(official ? official.teamGamePlayed : team?.performance?.teamGamePlayed)
    const points = numberOrNull(official ? official.points : team?.performance?.points)
    const rank = numberOrNull(official ? official.rank : team?.performance?.tableRank)
    const previous = details.previousTeamsById?.[team?.teamId]
    const previousRank = numberOrNull(previous?.performance?.tableRank)
    const rankChange = buildTeamPerformanceInsight({
      currentSeason: { games, tableRank: rank, leagueLevel: team?.league?.leagueLevel },
      previousSeason: previous ? {
        games: previous.performance?.teamGamePlayed,
        tableRank: previousRank,
        leagueLevel: details.previousLeaguesById?.[previous.leagueId]?.leagueLevel,
      } : null,
      selectedSeasonOption: { target: team?.seasonStatus === 'upcoming' ? 'future' : 'current' },
    }).facts.rankDelta
    return {
      id: team?.teamId || `missing-${group.birthYear}`,
      birthYear: Number(group.birthYear),
      ageGroup: team?.ageGroupLabel || team?.ageGroupId || '—',
      teamSlot: numberOrNull(team?.teamSlot),
      leagueName: team?.league?.leagueName || 'ליגה לא ידועה',
      leagueLevel: numberOrNull(team?.league?.leagueLevel),
      rank,
      games,
      points,
      successPercent: calculateSuccessPercent(points, games),
      goalsFor: numberOrNull(official?.goalsFor),
      goalsAgainst: numberOrNull(official?.goalsAgainst),
      previousRank,
      rankChange,
      projection: STATUS_PRESENTATION[status],
      projectedLevel: ['UNKNOWN', 'CURRENT_LEVEL'].includes(status)
        ? null : numberOrNull(projection?.projectedNextLeagueLevel),
    }
  }).sort((left, right) => (left.teamSlot || Infinity) - (right.teamSlot || Infinity))
})
