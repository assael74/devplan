import {
  CLUB_INTELLIGENCE_AVAILABILITY,
  CLUB_SIGNAL_COVERAGE_FAMILY,
  CLUB_SIGNAL_COVERAGE_REASON,
  CLUB_SIGNAL_COVERAGE_STATUS,
} from './clubIntelligence.contract.js'
import { CLUB_COMPETITION_STATUS } from '../contracts/club.contract.js'

const FOCUS_AGE_GROUPS = Object.freeze([
  { ageGroupId: 'u14', ageGroupLabel: 'ילדים א׳' },
  { ageGroupId: 'u15', ageGroupLabel: 'נערים ג׳' },
])

const FUTURE_SOURCE_AGE_GROUP_ID = Object.freeze({
  u14: 'u15',
  u15: 'u16',
})

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const positiveNumberOrNull = value => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

const currentTeams = birthYearTeams => (
  (Array.isArray(birthYearTeams) ? birthYearTeams : []).flatMap(birthYearTeam => (
    Array.isArray(birthYearTeam?.seasons?.current?.teams)
      ? birthYearTeam.seasons.current.teams.map(team => ({
          ...team,
          birthYear: positiveNumberOrNull(team?.birthYear) ||
            positiveNumberOrNull(birthYearTeam?.birthYear),
        }))
      : []
  ))
)

const teamSlot = team => positiveNumberOrNull(team?.birthTeamSlot || team?.teamSlot)

const competitionSourceTeamSlot = competition => (
  positiveNumberOrNull(competition?.sourceTeamSlot)
)

const focusTeamResult = ({ teams, ageGroupId }) => {
  const candidates = teams.filter(team => (
    clean(team?.ageGroupId) === ageGroupId && teamSlot(team) === 1
  ))

  if (candidates.length === 1) return { team: candidates[0], reason: null }

  return {
    team: null,
    reason: candidates.length > 1
      ? CLUB_SIGNAL_COVERAGE_REASON.FOCUS_PRIMARY_TEAM_AMBIGUOUS
      : CLUB_SIGNAL_COVERAGE_REASON.FOCUS_PRIMARY_TEAM_MISSING,
  }
}

const focusAgeGroup = ageGroupId => (
  FOCUS_AGE_GROUPS.find(item => item.ageGroupId === ageGroupId) || null
)

const coverageResult = ({ coveredAgeGroupIds = [], reasons = [] } = {}) => {
  const covered = FOCUS_AGE_GROUPS.filter(item => (
    coveredAgeGroupIds.includes(item.ageGroupId)
  ))
  const missing = FOCUS_AGE_GROUPS.filter(item => (
    !coveredAgeGroupIds.includes(item.ageGroupId)
  ))

  return {
    status: covered.length === FOCUS_AGE_GROUPS.length
      ? CLUB_SIGNAL_COVERAGE_STATUS.FULL
      : covered.length
        ? CLUB_SIGNAL_COVERAGE_STATUS.PARTIAL
        : CLUB_SIGNAL_COVERAGE_STATUS.NONE,
    coveredFocusAgeGroups: covered,
    missingFocusAgeGroups: missing,
    reasons,
  }
}

const leagueLevelOf = team => positiveNumberOrNull(team?.league?.leagueLevel)

const findBirthYearTeam = ({ birthYearTeams, birthYear }) => (
  (Array.isArray(birthYearTeams) ? birthYearTeams : []).find(item => (
    positiveNumberOrNull(item?.birthYear) === birthYear
  )) || null
)

const futurePathReason = ({
  focusAgeGroupId,
  focusTeam,
  sourceAgeGroupId,
  sourceTeam,
  birthYearTeams,
}) => {
  if (!focusTeam) {
    return {
      reason: CLUB_SIGNAL_COVERAGE_REASON.FOCUS_PRIMARY_TEAM_MISSING,
      requiredAgeGroupId: focusAgeGroupId,
    }
  }
  if (!sourceTeam) {
    return {
      reason: CLUB_SIGNAL_COVERAGE_REASON.SOURCE_FOCUS_TEAM_MISSING,
      requiredAgeGroupId: sourceAgeGroupId,
    }
  }
  if (!leagueLevelOf(focusTeam)) {
    return {
      reason: CLUB_SIGNAL_COVERAGE_REASON.LEAGUE_LEVEL_MISSING,
      requiredAgeGroupId: focusAgeGroupId,
    }
  }
  if (!leagueLevelOf(sourceTeam)) {
    return {
      reason: CLUB_SIGNAL_COVERAGE_REASON.LEAGUE_LEVEL_MISSING,
      requiredAgeGroupId: sourceAgeGroupId,
    }
  }

  const birthYearTeam = findBirthYearTeam({
    birthYearTeams,
    birthYear: positiveNumberOrNull(focusTeam?.birthYear),
  })
  const competition = birthYearTeam?.competition || {}
  const status = clean(competition?.status).toUpperCase()
  const isAvailable = (
    competition?.availability?.availability === CLUB_INTELLIGENCE_AVAILABILITY.AVAILABLE &&
    status !== CLUB_COMPETITION_STATUS.UNKNOWN &&
    positiveNumberOrNull(competition?.currentLeagueLevel) &&
    positiveNumberOrNull(competition?.projectedNextLeagueLevel)
  )

  if (!isAvailable) {
    return {
      reason: CLUB_SIGNAL_COVERAGE_REASON.FUTURE_PATH_UNAVAILABLE,
      requiredAgeGroupId: focusAgeGroupId,
    }
  }

  if (
    clean(competition?.sourceTeamId) !== clean(sourceTeam?.teamId) ||
    competitionSourceTeamSlot(competition) !== teamSlot(sourceTeam)
  ) {
    return {
      reason: CLUB_SIGNAL_COVERAGE_REASON.FUTURE_PATH_SOURCE_MISMATCH,
      requiredAgeGroupId: sourceAgeGroupId,
    }
  }

  return null
}

const buildFutureLeaguePathCoverage = ({ teams, birthYearTeams }) => {
  const results = FOCUS_AGE_GROUPS.map(focus => {
    const focusResult = focusTeamResult({ teams, ageGroupId: focus.ageGroupId })
    const sourceResult = focusTeamResult({
      teams,
      ageGroupId: FUTURE_SOURCE_AGE_GROUP_ID[focus.ageGroupId],
    })
    const sourceAgeGroupId = FUTURE_SOURCE_AGE_GROUP_ID[focus.ageGroupId]
    const result = futurePathReason({
      focusAgeGroupId: focus.ageGroupId,
      focusTeam: focusResult.team,
      sourceAgeGroupId,
      sourceTeam: sourceResult.team,
      birthYearTeams,
    }) || {
      reason: focusResult.reason || sourceResult.reason,
      requiredAgeGroupId: focus.ageGroupId,
    }

    return { ageGroupId: focus.ageGroupId, ...result }
  })

  return coverageResult({
    coveredAgeGroupIds: results.filter(item => !item.reason).map(item => item.ageGroupId),
    reasons: results.filter(item => item.reason).map(item => ({
      ageGroup: focusAgeGroup(item.ageGroupId),
      requiredAgeGroup: focusAgeGroup(item.requiredAgeGroupId),
      reason: item.reason,
    })),
  })
}

const buildLeagueVsClubLevelCoverage = ({ club, teams }) => {
  const clubLevel = positiveNumberOrNull(club?.clubLevel)
  const results = FOCUS_AGE_GROUPS.map(focus => {
    const result = focusTeamResult({ teams, ageGroupId: focus.ageGroupId })
    const reason = result.reason ||
      (!clubLevel ? CLUB_SIGNAL_COVERAGE_REASON.CLUB_LEVEL_MISSING : null) ||
      (!leagueLevelOf(result.team) ? CLUB_SIGNAL_COVERAGE_REASON.LEAGUE_LEVEL_MISSING : null)

    return { ageGroupId: focus.ageGroupId, reason }
  })

  return coverageResult({
    coveredAgeGroupIds: results.filter(item => !item.reason).map(item => item.ageGroupId),
    reasons: results.filter(item => item.reason).map(item => ({
      ageGroup: focusAgeGroup(item.ageGroupId),
      reason: item.reason,
    })),
  })
}

const buildSquadTaskCoverage = ({ teams }) => {
  const results = FOCUS_AGE_GROUPS.map(focus => {
    const result = focusTeamResult({ teams, ageGroupId: focus.ageGroupId })
    const availability = result.team?.teamTaskAvailability || null
    const reason = result.reason ||
      (availability?.availability === CLUB_INTELLIGENCE_AVAILABILITY.AVAILABLE
        ? null
        : clean(availability?.reason) ||
          CLUB_SIGNAL_COVERAGE_REASON.TEAM_TASK_AVAILABILITY_UNKNOWN)

    return { ageGroupId: focus.ageGroupId, reason }
  })

  return coverageResult({
    coveredAgeGroupIds: results.filter(item => !item.reason).map(item => item.ageGroupId),
    reasons: results.filter(item => item.reason).map(item => ({
      ageGroup: focusAgeGroup(item.ageGroupId),
      reason: item.reason,
    })),
  })
}

export const buildClubSignalCoverage = ({ club = {}, birthYearTeams = [] } = {}) => {
  const teams = currentTeams(birthYearTeams)

  return {
    [CLUB_SIGNAL_COVERAGE_FAMILY.FUTURE_LEAGUE_PATH]: buildFutureLeaguePathCoverage({
      teams,
      birthYearTeams,
    }),
    [CLUB_SIGNAL_COVERAGE_FAMILY.LEAGUE_VS_CLUB_LEVEL]: buildLeagueVsClubLevelCoverage({
      club,
      teams,
    }),
    [CLUB_SIGNAL_COVERAGE_FAMILY.SQUAD_TASK]: buildSquadTaskCoverage({ teams }),
  }
}
