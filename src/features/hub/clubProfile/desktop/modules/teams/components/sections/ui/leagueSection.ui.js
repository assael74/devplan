// clubProfile/desktop/modules/teams/components/sections/ui/leagueSection.ui.js

const emptyDash = '—'

const getNumberLabel = (value, fallback = 0) => {
  return value == null || value === '' ? fallback : value
}

export const buildLeagueSectionModel = row => {
  const team = row || {}

  return {
    position: getNumberLabel(team?.leaguePosition),
    points: getNumberLabel(team?.points),
    goalsFor: getNumberLabel(team?.leagueGoalsFor),
    goalsAgainst: getNumberLabel(team?.leagueGoalsAgainst),

    hasLeagueData: Boolean(
      team?.leaguePosition != null ||
        team?.points != null ||
        team?.leagueGoalsFor != null ||
        team?.leagueGoalsAgainst != null
    ),

    emptyLabel: emptyDash,
  }
}
