// teamProfile/sharedLogic/management/management.state.js

import {
  buildTeamTargetsState,
} from '../../../../../shared/teams/targets/index.js'

import { safeText } from './management.safe.js'

import {
  calcAchievementRate,
  calcActualSuccessRate,
} from './management.kpis.js'

export function buildManagementTargetsState({
  team,
  draft,
}) {
  const source = {
    ...(team || {}),
    ...(draft || {}),
  }

  const targets = buildTeamTargetsState(source)
  const values = targets?.values || {}

  const actualSuccessRate = calcActualSuccessRate(
    source.points,
    source.leagueRound
  )

  return {
    team: source,
    targets,
    actual: {
      leaguePosition: safeText(source.leaguePosition, '—'),
      points: safeText(source.points, '—'),
      leagueRound: safeText(source.leagueRound, '—'),
      leagueNumGames: safeText(source.leagueNumGames, '—'),
      leagueGoalsFor: safeText(source.leagueGoalsFor, '—'),
      leagueGoalsAgainst: safeText(source.leagueGoalsAgainst, '—'),
      actualSuccessRate,
      goalsForAchievementRate: calcAchievementRate(
        source.leagueGoalsFor,
        values.goalsFor,
        'higher'
      ),
      goalsAgainstAchievementRate: calcAchievementRate(
        source.leagueGoalsAgainst,
        values.goalsAgainst,
        'lower'
      ),
    },
  }
}
