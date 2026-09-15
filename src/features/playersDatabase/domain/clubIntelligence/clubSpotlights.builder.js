import {
  CLUB_INTELLIGENCE_AVAILABILITY,
  CLUB_LEAGUE_LEVEL_GAP_THRESHOLD,
  CLUB_SPOTLIGHT_TYPE,
} from './clubIntelligence.contract.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const positiveNumberOrNull = value => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

const buildSpotlightId = ({ type, birthYear, sourceIdentity }) => (
  [
    clean(type),
    clean(birthYear),
    clean(sourceIdentity),
  ].filter(Boolean).join(':')
)

const teamSourceIdentity = ({ team, teamIndex }) => {
  const teamId = clean(team?.teamId)
  if (teamId) return `team:${teamId}`

  const leagueId = clean(team?.league?.leagueId)
  const slot = positiveNumberOrNull(
    team?.teamSlot || team?.birthTeamSlot || team?.slot
  ) || (teamIndex + 1)

  return `team-slot:${slot}:league:${leagueId || 'unknown'}`
}

const isTaskSourceUnavailable = availability => (
  availability?.availability === CLUB_INTELLIGENCE_AVAILABILITY.UNAVAILABLE
)

const buildFutureLeaguePathSpotlight = birthYearTeam => {
  if (
    birthYearTeam?.competition?.availability?.availability ===
    CLUB_INTELLIGENCE_AVAILABILITY.UNAVAILABLE
  ) return null

  const currentLeagueLevel = positiveNumberOrNull(
    birthYearTeam?.competition?.currentLeagueLevel
  )
  const projectedNextLeagueLevel = positiveNumberOrNull(
    birthYearTeam?.competition?.projectedNextLeagueLevel
  )

  if (!currentLeagueLevel || !projectedNextLeagueLevel) return null
  if (currentLeagueLevel === projectedNextLeagueLevel) return null

  const type = projectedNextLeagueLevel < currentLeagueLevel
    ? CLUB_SPOTLIGHT_TYPE.FUTURE_LEAGUE_PATH_RISE
    : CLUB_SPOTLIGHT_TYPE.FUTURE_LEAGUE_PATH_DROP
  const sourceBirthYear = positiveNumberOrNull(
    birthYearTeam?.competition?.sourceBirthYear
  ) || positiveNumberOrNull(birthYearTeam?.birthYear)

  return {
    id: buildSpotlightId({
      type,
      birthYear: birthYearTeam.birthYear,
      sourceIdentity: `competition-source-birth-year:${sourceBirthYear || 'unknown'}`,
    }),
    type,
    birthYear: birthYearTeam.birthYear,
    teamId: null,
    context: {
      currentLeagueLevel,
      projectedNextLeagueLevel,
      status: clean(birthYearTeam?.competition?.status) || 'UNKNOWN',
      source: clean(birthYearTeam?.competition?.source) || 'AUTOMATIC',
      availability: birthYearTeam?.competition?.availability || null,
    },
  }
}

const buildLeagueLevelSpotlight = ({ birthYear, clubLevel, team }) => {
  const leagueLevel = positiveNumberOrNull(team?.league?.leagueLevel)
  if (!clubLevel || !leagueLevel) return null

  const gap = leagueLevel - clubLevel
  if (Math.abs(gap) < CLUB_LEAGUE_LEVEL_GAP_THRESHOLD) return null

  const type = gap < 0
    ? CLUB_SPOTLIGHT_TYPE.LEAGUE_ABOVE_CLUB_LEVEL
    : CLUB_SPOTLIGHT_TYPE.LEAGUE_BELOW_CLUB_LEVEL

  return {
    id: buildSpotlightId({
      type,
      birthYear,
      sourceIdentity: team.sourceIdentity,
    }),
    type,
    birthYear,
    teamId: clean(team?.teamId) || null,
    context: {
      clubLevel,
      leagueLevel,
      gap,
    },
  }
}

const buildSquadTaskSpotlights = ({ birthYear, team }) => {
  const taskSignals = team?.teamTaskSignals || {}
  const availability = team?.teamTaskAvailability || null
  if (isTaskSourceUnavailable(availability)) return []

  const base = {
    birthYear,
    teamId: clean(team?.teamId) || null,
    context: {
      availability,
    },
  }

  return [
    taskSignals.offense === true
      ? {
          ...base,
          id: buildSpotlightId({
            type: CLUB_SPOTLIGHT_TYPE.OFFENSE_SQUAD_TASK,
            birthYear,
            sourceIdentity: team.sourceIdentity,
          }),
          type: CLUB_SPOTLIGHT_TYPE.OFFENSE_SQUAD_TASK,
        }
      : null,
    taskSignals.defense === true
      ? {
          ...base,
          id: buildSpotlightId({
            type: CLUB_SPOTLIGHT_TYPE.DEFENSE_SQUAD_TASK,
            birthYear,
            sourceIdentity: team.sourceIdentity,
          }),
          type: CLUB_SPOTLIGHT_TYPE.DEFENSE_SQUAD_TASK,
        }
      : null,
  ].filter(Boolean)
}

export const buildClubSpotlights = ({ club = {}, birthYearTeams = [] } = {}) => {
  const clubLevel = positiveNumberOrNull(
    club?.clubStrengthLevel || club?.clubLevel
  )

  return (Array.isArray(birthYearTeams) ? birthYearTeams : []).flatMap(birthYearTeam => {
    const currentTeams = Array.isArray(birthYearTeam?.seasons?.current?.teams)
      ? birthYearTeam.seasons.current.teams
      : []
    const futureLeaguePathSpotlight = buildFutureLeaguePathSpotlight(birthYearTeam)

    return [
      futureLeaguePathSpotlight,
      ...currentTeams.map((team, teamIndex) => buildLeagueLevelSpotlight({
        birthYear: birthYearTeam.birthYear,
        clubLevel,
        team: {
          ...team,
          sourceIdentity: teamSourceIdentity({ team, teamIndex }),
        },
      })),
      ...currentTeams.flatMap((team, teamIndex) => buildSquadTaskSpotlights({
        birthYear: birthYearTeam.birthYear,
        team: {
          ...team,
          sourceIdentity: teamSourceIdentity({ team, teamIndex }),
        },
      })),
    ].filter(Boolean)
  })
}
