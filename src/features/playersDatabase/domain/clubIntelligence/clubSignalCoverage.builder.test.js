// src/features/playersDatabase/domain/clubIntelligence/clubSignalCoverage.builder.test.js

import { buildClubSignalCoverage } from './clubSignalCoverage.builder.js'
import { buildClubCompetitionPath } from './clubCompetitionPath.builder.js'
import { buildTeamSignalSummary } from '../signals/teamSignalSummary.js'
import { buildTeamSignals } from '../../model/team/signals/teamSignals.model.js'

const summary = (availability, level = null) => buildTeamSignalSummary({
  familiesById: { 'roster-balance': { availability, level } },
})

const team = (ageGroupId, extra = {}) => ({
  teamId: ageGroupId,
  ageGroupId,
  birthYear: 2027 - Number(ageGroupId.slice(1)),
  teamSlot: 1,
  seasonId: '2026_2027',
  seasonKey: '26/27',
  seasonStatus: 'completed',
  league: { leagueLevel: 2 },
  competitionProjection: { effective: { status: 'STABLE', projectedNextLeagueLevel: 2 } },
  ...extra,
})

const intelligence = teams => ({
  birthYearTeams: teams.map(current => ({
    birthYear: current.birthYear,
    seasons: { current: { teams: [current] } },
  })),
})

const coverage = (teams, club = { clubLevel: 2 }) => buildClubSignalCoverage({
  club,
  ...intelligence(teams),
})

test('document existence and legacy flags do not prove roster analysis is available', () => {
  const teams = ['u14', 'u15'].map(id => team(id, {
    documentExists: true,
    teamTaskSignals: { offense: true, defense: true },
    teamTaskAvailability: { availability: 'available' },
  }))
  expect(coverage(teams).squadTask).toMatchObject({ status: 'none', availability: 'unavailable' })
  expect(coverage(teams).squadTask.missingFocusAgeGroups.map(item => item.ageGroupId))
    .toEqual(['u14', 'u15'])
})

test('a complete analysis with zero signals counts as covered; other ages cannot replace a focus age', () => {
  const teams = ['u14', 'u15', 'u16', 'u19'].map(id => team(id, {
    teamSignalSummary: summary('available', 0),
  }))
  expect(coverage(teams).squadTask).toMatchObject({ status: 'full', reasons: [] })
  expect(coverage(teams.filter(item => item.ageGroupId !== 'u14')).squadTask.status).toBe('partial')
})

test('partial analysis stays partial even when neither focus age is fully covered', () => {
  const result = coverage([
    team('u14', { teamSignalSummary: summary('partial', 1) }),
    team('u15', { teamSignalSummary: summary('partial') }),
  ]).squadTask
  expect(result).toMatchObject({ status: 'partial', availability: 'partial', coveredFocusAgeGroups: [] })
  expect(result.partialFocusAgeGroups.map(item => item.ageGroupId)).toEqual(['u14', 'u15'])
  expect(result.reasons.every(item => item.reason === 'team_task_availability_partial')).toBe(true)
})

test('a stale summary is unavailable and does not fall back to legacy availability', () => {
  const result = coverage(['u14', 'u15'].map(id => team(id, {
    teamSignalSummary: { ...summary('available', 1), calibrationVersion: 'old' },
    teamTaskAvailability: { availability: 'available' },
  })))
  expect(result.squadTask.status).toBe('none')
})

test('missing, secondary and ambiguous primary teams never count as covered', () => {
  const result = coverage([
    team('u14', { teamSlot: 2, teamSignalSummary: summary('available', 1) }),
    team('u15', { teamSignalSummary: summary('available', 1) }),
    team('u15', { teamId: 'duplicate', teamSignalSummary: summary('available', 1) }),
  ])
  Object.values(result).forEach(family => expect(family.status).toBe('none'))
  expect(result.squadTask.reasons.map(item => item.reason)).toEqual([
    'focus_primary_team_missing', 'focus_primary_team_ambiguous',
  ])
})

test('club-level coverage uses the same gap availability as team signals without requiring history', () => {
  const teams = [team('u14'), team('u15')]
  expect(coverage(teams).leagueVsClubLevel.status).toBe('full')
  const gap = buildTeamSignals({ view: { team: teams[0] }, club: { clubLevel: 2 } })
    .familiesById['club-gap'].signalsById['league-vs-club']
  expect(gap).toMatchObject({ level: 0, availability: 'available' })
  expect(coverage(teams, {}).leagueVsClubLevel.reasons.map(item => item.reason))
    .toEqual(['club_level_missing', 'club_level_missing'])
  teams[0].league.leagueLevel = null
  expect(coverage(teams).leagueVsClubLevel.status).toBe('partial')
})

test('future coverage shares the canonical forecast decision and u15 requires the u16 source', () => {
  const teams = [team('u14'), team('u15'), team('u16')]
  teams.forEach(current => { current.futureCompetition = buildClubCompetitionPath(current, teams) })
  expect(coverage(teams).futureLeaguePath.status).toBe('full')
  const state = buildTeamSignals({ view: { team: teams[0] }, clubIntelligence: intelligence(teams) })
  expect(state.summary.familiesById['future-competition'])
    .toEqual({ level: 0, availability: 'available' })

  const missingSource = coverage(teams.slice(0, 2)).futureLeaguePath
  expect(missingSource.status).toBe('partial')
  expect(missingSource.reasons[0]).toMatchObject({
    ageGroup: { ageGroupId: 'u15' },
    requiredAgeGroup: { ageGroupId: 'u16' },
    reason: 'source_focus_team_missing',
  })

  teams[1].seasonStatus = 'not_started'
  teams[0].futureCompetition = buildClubCompetitionPath(teams[0], teams)
  expect(coverage(teams).futureLeaguePath.reasons[0].reason).toBe('future_path_unavailable')
  expect(buildTeamSignals({ view: { team: teams[0] }, clubIntelligence: intelligence(teams) })
    .summary.familiesById['future-competition'].availability).toBe('unavailable')
})

test('a forecast linked to another source team does not cover the focus age', () => {
  const teams = [team('u14'), team('u15'), team('u16')]
  teams.forEach(current => { current.futureCompetition = buildClubCompetitionPath(current, teams) })
  teams[0].futureCompetition.sourceTeamId = 'another-team'
  expect(coverage(teams).futureLeaguePath).toMatchObject({
    status: 'partial', reasons: [{ reason: 'future_path_source_mismatch' }],
  })
})
