// Pure league schedule projections derived from a reliable number of teams.

const toTeamsCount = value => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 2 ? Math.floor(number) : 0
}

const toPositiveRound = value => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0
}

export const buildExpectedLeagueGamesPerTeam = teamsCountValue => {
  const teamsCount = toTeamsCount(teamsCountValue)
  return teamsCount ? (teamsCount - 1) * 2 : 0
}

export const buildLeagueTotalRound = teamsCountValue => {
  const teamsCount = toTeamsCount(teamsCountValue)
  if (!teamsCount) return 0

  return teamsCount % 2 === 0
    ? (teamsCount - 1) * 2
    : teamsCount * 2
}

export const buildLeagueScheduleProjection = teamsCountValue => ({
  teamsCount: toTeamsCount(teamsCountValue),
  expectedGamesPerTeam: buildExpectedLeagueGamesPerTeam(teamsCountValue),
  leagueTotalRound: buildLeagueTotalRound(teamsCountValue),
})

// A persisted leagueTotalRound is canonical. Team count can describe the
// double-round-robin fallback only; it must never replace an explicit season
// schedule. For an odd number of teams, rounds include bye rounds while each
// team plays two fewer games than the round count.
export const resolveLeagueScheduleProjection = ({
  teamsCount = 0,
  leagueTotalRound = null,
} = {}) => {
  const fallback = buildLeagueScheduleProjection(teamsCount)
  const canonicalLeagueTotalRound = toPositiveRound(leagueTotalRound)
  const fallbackLeagueTotalRound = fallback.leagueTotalRound

  return {
    ...fallback,
    leagueTotalRound: canonicalLeagueTotalRound || fallbackLeagueTotalRound,
    leagueTotalRoundSource: canonicalLeagueTotalRound
      ? 'canonical'
      : fallbackLeagueTotalRound
        ? 'teamsCountFallback'
        : 'missing',
  }
}
