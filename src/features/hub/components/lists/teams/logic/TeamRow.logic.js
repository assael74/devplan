export function buildTeamSubLine(team) {
  const clubName = team?.club?.clubName || team?.clubName || ''
  const teamYear = team?.teamYear || team?.year || team?.birthYear || ''

  return [clubName, teamYear].filter(Boolean).join(' · ')
}

export function isProjectTeam(team) {
  return team?.project
}
