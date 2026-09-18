import {
  CLUB_INTELLIGENCE_AVAILABILITY,
  CLUB_LEAGUE_LEVEL_GAP_THRESHOLD,
  CLUB_SPOTLIGHT_TYPE,
} from './clubIntelligence.contract.js'
import { CLUB_COMPETITION_STATUS } from '../contracts/club.contract.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const positiveNumberOrNull = value => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

const isPrimaryTeam = team => (
  positiveNumberOrNull(team?.birthTeamSlot || team?.teamSlot) === 1
)

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

const resolveFutureLeaguePathTargetTeam = ({ birthYearTeam, sourceTeamSlot }) => {
  const targetTeams = Array.isArray(birthYearTeam?.seasons?.current?.teams)
    ? birthYearTeam.seasons.current.teams
    : []
  const candidates = targetTeams.filter(team => (
    positiveNumberOrNull(team?.birthTeamSlot || team?.teamSlot) === sourceTeamSlot
  ))

  return candidates.length === 1 ? candidates[0] : null
}

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
  const teamId = clean(birthYearTeam?.competition?.sourceTeamId)
  const teamSlot = positiveNumberOrNull(
    birthYearTeam?.competition?.sourceTeamSlot
  )
  const status = clean(birthYearTeam?.competition?.status).toUpperCase()

  if (
    !currentLeagueLevel ||
    !projectedNextLeagueLevel ||
    !teamId ||
    teamSlot !== 1 ||
    status === CLUB_COMPETITION_STATUS.UNKNOWN
  ) return null
  if (currentLeagueLevel === projectedNextLeagueLevel) return null

  const targetTeam = resolveFutureLeaguePathTargetTeam({
    birthYearTeam,
    sourceTeamSlot: teamSlot,
  })
  const targetTeamId = clean(targetTeam?.teamId)

  if (!targetTeamId || !isPrimaryTeam(targetTeam)) return null

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
      sourceIdentity: `team:${targetTeamId}`,
    }),
    type,
    birthYear: birthYearTeam.birthYear,
    teamId: targetTeamId,
    context: {
      teamSlot: positiveNumberOrNull(targetTeam?.birthTeamSlot || targetTeam?.teamSlot),
      sourceBirthYear,
      sourceTeamId: teamId,
      sourceTeamSlot: teamSlot,
      currentLeagueLevel,
      projectedNextLeagueLevel,
      status: clean(birthYearTeam?.competition?.status) || 'UNKNOWN',
      source: clean(birthYearTeam?.competition?.source) || 'AUTOMATIC',
      availability: birthYearTeam?.competition?.availability || null,
    },
  }
}

const buildLeagueLevelSpotlight = ({ birthYear, clubLevel, team }) => {
  if (!isPrimaryTeam(team)) return null

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
  if (!isPrimaryTeam(team)) return []

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
