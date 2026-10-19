// src/features/playersDatabase/services/audit/signals/buildExpectedTeamSignals.js

import { buildClubTeamSignalStates } from '../../../model/team/signals/teamSignalSources.model.js'

export const teamSignalAuditKey = (teamId, seasonId) => `${teamId}__${seasonId}`

export const buildExpectedTeamSignals = ({
  leagues = [],
  teamSeasons = [],
  profilesById = {},
  clubIds = [],
} = {}) => {
  const summaries = new Map()
  for (const clubId of new Set(clubIds.filter(Boolean))) {
    const clubSeasons = teamSeasons.filter(season => season.identity?.clubId === clubId)
    const clubLeagues = leagues.filter(league => (
      Object.values(league.seasonsById || {}).some(season => (
        Object.values(season.table?.teamsById || {}).some(team => team.clubId === clubId)
      )) || clubSeasons.some(season => season.identity?.leagueId === (league.id || league.leagueId))
    ))
    const states = buildClubTeamSignalStates({
      clubId, leagues: clubLeagues, teamSeasons: clubSeasons, profilesById,
    })
    states.forEach(({ teamId, seasonId, state }) => {
      summaries.set(teamSignalAuditKey(teamId, seasonId), state.summary)
    })
  }
  return summaries
}
