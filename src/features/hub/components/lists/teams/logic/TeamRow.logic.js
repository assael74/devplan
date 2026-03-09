export function buildTeamSubLine(team) {
  const clubName = team?.club?.clubName || ''
  const teamYear = team?.teamYear || team?.year || ''
  return [clubName, teamYear].filter(Boolean).join(' • ')
}

export function isProjectTeam(team) {
  return team?.project
}
