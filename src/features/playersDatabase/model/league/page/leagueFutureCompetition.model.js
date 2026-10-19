// src/features/playersDatabase/model/league/page/leagueFutureCompetition.model.js

import { buildTeamCompetitionState } from '../../../domain/league/clubsCenterTeam.builder.js'
import { describeUnavailableFutureCompetition } from '../../shared/futureCompetition.presentation.js'

export const resolveLeagueFutureCompetitionSource = ({
  clubId,
  teamSlot,
  birthYear,
  seasonId,
  leaguesCenterDocument,
}) => {
  const sourceBirthYear = Number(birthYear) - 1
  if (!clubId || !(Number(teamSlot) > 0) || !(sourceBirthYear > 0) || !seasonId) {
    return { description: 'חסרים נתוני זיהוי השנתון המשפיע' }
  }
  const candidates = []
  Object.entries(leaguesCenterDocument?.leaguesById || {}).forEach(([leagueId, league]) => {
    const season = league.seasonsById?.[seasonId]
    if (Number(season?.birthYear) !== sourceBirthYear) return
    Object.entries(season.teamsById || {}).forEach(([teamId, team]) => {
      if (team.clubId === clubId && Number(team.teamSlot) === Number(teamSlot)) {
        candidates.push({ leagueId, teamId, clubId, teamSlot: Number(teamSlot), seasonId, sourceBirthYear })
      }
    })
  })
  if (candidates.length !== 1) {
    return { description: describeUnavailableFutureCompetition({
      reason: candidates.length ? 'SOURCE_AMBIGUOUS' : 'SOURCE_MISSING', sourceBirthYear,
    }) }
  }
  return { source: candidates[0] }
}

export const describeLeagueFutureCompetition = (source, leagueDocument) => {
  const describe = reason => describeUnavailableFutureCompetition({
    sourceBirthYear: source.sourceBirthYear, unavailableReasons: [reason],
  })
  if (!leagueDocument) return describe('LEAGUE_UNAVAILABLE')
  const season = leagueDocument.seasonsById?.[source.seasonId]
  if (!season || Number(season.birthYear) !== source.sourceBirthYear) return describe('LEAGUE_SEASON_MISSING')
  const teamRow = season.table?.teamsById?.[source.teamId]
  if (!teamRow || teamRow.clubId !== source.clubId || Number(teamRow.teamSlot) !== source.teamSlot) {
    return describe('TEAM_NOT_IN_TABLE')
  }
  const state = buildTeamCompetitionState({ league: leagueDocument, season, teamId: source.teamId, teamRow })
  if (state.unavailableReasons.length) {
    return describeUnavailableFutureCompetition({
      sourceBirthYear: source.sourceBirthYear, unavailableReasons: state.unavailableReasons,
    })
  }
  return 'נתוני ליגת המקור זמינים, אך סיכום צפי התחרות בטבלת הליגה טרם עודכן'
}
