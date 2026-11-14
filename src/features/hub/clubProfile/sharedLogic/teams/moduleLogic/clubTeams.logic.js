// src/features/hub/clubProfile/sharedLogic/teams/moduleLogic/clubTeams.logic.js

export const buildClubTeamRows = ({
  club,
  teams = [],
} = {}) => {
  const sourceTeams = Array.isArray(teams) && teams.length
    ? teams
    : Array.isArray(club?.teams)
      ? club.teams
      : []

  const rows = sourceTeams.map(team => {
    return {
      ...team,
      id: team?.id || team?.teamId,
      teamId: team?.teamId || team?.id,
    }
  })

  return {
    rows,
    summary: {
      total: rows.length,
      active: rows.filter(row => row?.active !== false).length,
      project: rows.filter(row => row?.type === 'project').length,
    },
  }
}
