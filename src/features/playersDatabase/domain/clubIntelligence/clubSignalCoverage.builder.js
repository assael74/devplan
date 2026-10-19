// src/features/playersDatabase/domain/clubIntelligence/clubSignalCoverage.builder.js

import {
  CLUB_SIGNAL_COVERAGE_FAMILY,
  CLUB_SIGNAL_COVERAGE_REASON,
  CLUB_SIGNAL_COVERAGE_STATUS,
} from './clubIntelligence.contract.js'
import {
  mergeSignalAvailability,
  readCompetitionAvailability,
} from '../signals/teamSignalAvailability.js'
import { buildTeamClubLevelGap } from '../signals/teamSignalFacts.js'
import { readTeamSignalSummary } from '../signals/teamSignalSummary.js'

const FOCUS_AGE_GROUPS = Object.freeze([
  { ageGroupId: 'u14', ageGroupLabel: 'ילדים א׳' },
  { ageGroupId: 'u15', ageGroupLabel: 'נערים ג׳' },
])

const FUTURE_SOURCE_AGE_GROUP_ID = Object.freeze({ u14: 'u15', u15: 'u16' })

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const positiveNumberOrNull = value => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

const teamSlot = team => positiveNumberOrNull(team?.birthTeamSlot || team?.teamSlot)

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

const ageGroup = ageGroupId => (
  FOCUS_AGE_GROUPS.find(item => item.ageGroupId === ageGroupId) ||
  (ageGroupId === 'u16' ? { ageGroupId, ageGroupLabel: 'נערים ב׳' } : null)
)

const coverageResult = results => {
  const availability = mergeSignalAvailability(results.map(result => result.availability))
  return {
    availability,
    status: availability === 'available' ? CLUB_SIGNAL_COVERAGE_STATUS.FULL
      : availability === 'partial' ? CLUB_SIGNAL_COVERAGE_STATUS.PARTIAL
        : CLUB_SIGNAL_COVERAGE_STATUS.NONE,
    coveredFocusAgeGroups: results.filter(result => result.availability === 'available')
      .map(result => ageGroup(result.ageGroupId)),
    partialFocusAgeGroups: results.filter(result => result.availability === 'partial')
      .map(result => ageGroup(result.ageGroupId)),
    missingFocusAgeGroups: results.filter(result => result.availability !== 'available')
      .map(result => ageGroup(result.ageGroupId)),
    reasons: results.filter(result => result.reason).map(result => ({
      ageGroup: ageGroup(result.ageGroupId),
      requiredAgeGroup: ageGroup(result.requiredAgeGroupId),
      reason: result.reason,
      availability: result.availability,
    })),
  }
}

const buildFutureLeaguePathCoverage = teams => coverageResult(FOCUS_AGE_GROUPS.map(focus => {
  const focusResult = focusTeamResult({ teams, ageGroupId: focus.ageGroupId })
  const sourceAgeGroupId = FUTURE_SOURCE_AGE_GROUP_ID[focus.ageGroupId]
  const sourceResult = focusTeamResult({ teams, ageGroupId: sourceAgeGroupId })
  const competition = focusResult.team?.futureCompetition
  let requiredAgeGroupId = focus.ageGroupId
  let reason = focusResult.reason

  if (!reason && sourceResult.reason) {
    reason = sourceResult.reason === CLUB_SIGNAL_COVERAGE_REASON.FOCUS_PRIMARY_TEAM_MISSING
      ? CLUB_SIGNAL_COVERAGE_REASON.SOURCE_FOCUS_TEAM_MISSING : sourceResult.reason
    requiredAgeGroupId = sourceAgeGroupId
  }
  if (!reason && readCompetitionAvailability(competition) !== 'available') {
    reason = CLUB_SIGNAL_COVERAGE_REASON.FUTURE_PATH_UNAVAILABLE
  }
  if (!reason && (
    clean(competition.sourceTeamId) !== clean(sourceResult.team.teamId) ||
    positiveNumberOrNull(competition.sourceTeamSlot) !== teamSlot(sourceResult.team)
  )) {
    reason = CLUB_SIGNAL_COVERAGE_REASON.FUTURE_PATH_SOURCE_MISMATCH
    requiredAgeGroupId = sourceAgeGroupId
  }
  return {
    ageGroupId: focus.ageGroupId,
    availability: reason ? 'unavailable' : 'available',
    reason,
    requiredAgeGroupId,
  }
}))

const buildLeagueVsClubLevelCoverage = ({ club, teams }) => coverageResult(FOCUS_AGE_GROUPS.map(focus => {
  const result = focusTeamResult({ teams, ageGroupId: focus.ageGroupId })
  const gap = result.team ? buildTeamClubLevelGap({ team: result.team, club }) : null
  return {
    ageGroupId: focus.ageGroupId,
    availability: gap?.availability || 'unavailable',
    reason: result.reason || gap?.reason,
  }
}))

const buildSquadTaskCoverage = teams => coverageResult(FOCUS_AGE_GROUPS.map(focus => {
  const result = focusTeamResult({ teams, ageGroupId: focus.ageGroupId })
  const availability = readTeamSignalSummary(result.team?.teamSignalSummary)
    .familiesById['roster-balance'].availability
  return {
    ageGroupId: focus.ageGroupId,
    availability,
    reason: result.reason || (availability === 'available' ? null
      : availability === 'partial' ? CLUB_SIGNAL_COVERAGE_REASON.TEAM_TASK_AVAILABILITY_PARTIAL
        : CLUB_SIGNAL_COVERAGE_REASON.TEAM_TASK_AVAILABILITY_UNKNOWN),
  }
}))

export const buildClubSignalCoverage = ({ club = {}, birthYearTeams = [] } = {}) => {
  const teams = (Array.isArray(birthYearTeams) ? birthYearTeams : [])
    .flatMap(group => group?.seasons?.current?.teams || [])
  return {
    [CLUB_SIGNAL_COVERAGE_FAMILY.FUTURE_LEAGUE_PATH]: buildFutureLeaguePathCoverage(teams),
    [CLUB_SIGNAL_COVERAGE_FAMILY.LEAGUE_VS_CLUB_LEVEL]: buildLeagueVsClubLevelCoverage({ club, teams }),
    [CLUB_SIGNAL_COVERAGE_FAMILY.SQUAD_TASK]: buildSquadTaskCoverage(teams),
  }
}
