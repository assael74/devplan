// src/features/playersDatabase/services/audit/signals/compareTeamSignalSummaries.test.js

import { compareTeamSignalSummaries } from './compareTeamSignalSummaries.js'
import { buildTeamSignalSummary } from '../../../domain/signals/teamSignalSummary.js'

test('reports missing summaries without inferring a result from retired flags', () => {
  expect(compareTeamSignalSummaries({ leagueTeam: { scouting: { teamTaskSignals: { offense: true } } } }))
    .toEqual([expect.objectContaining({ field: 'teamSignalSummary.missing', actual: null })])
})

test('detects an identically stale summary against canonical calculation without comparing calculation times', () => {
  const stored = buildTeamSignalSummary({ computedAt: 'old time' })
  const input = {
    teamSeason: { teamSignalSummary: stored }, leagueTeam: { teamSignalSummary: stored },
    leaguesCenterTeam: { teamSignalSummary: stored }, clubsCenterTeam: { teamSignalSummary: stored },
  }
  expect(compareTeamSignalSummaries({
    ...input, expectedSummary: { ...stored, computedAt: 'new time' },
  })).toEqual([])
  const expectedSummary = buildTeamSignalSummary({ familiesById: {
    'club-gap': { level: 1, availability: 'partial' },
  } })
  expect(compareTeamSignalSummaries({ ...input, expectedSummary }))
    .toEqual([expect.objectContaining({ field: 'teamSignalSummary.canonical' })])
  expect(compareTeamSignalSummaries({
    ...input, expectedSummary: { ...stored, computedAt: null },
    clubsCenterTeam: { teamSignalSummary: { ...stored, computedAt: 'different saved time' } },
  })).toEqual([expect.objectContaining({ field: 'clubsCenter.teamSignalSummary' })])
})

test('does not certify equal saved summaries when canonical calculation is unavailable', () => {
  const summary = buildTeamSignalSummary()
  expect(compareTeamSignalSummaries({
    leagueTeam: { teamSignalSummary: summary }, teamSeason: { teamSignalSummary: summary }, expectedSummary: null,
  })).toEqual([expect.objectContaining({ field: 'teamSignalSummary.canonical', actual: null })])
})

test('detects a missing or divergent projection and changed calibration', () => {
  const summary = buildTeamSignalSummary({ computedAt: '2026-10-18T12:00:00.000Z' })
  const input = {
    teamId: 'club_2012_1', clubId: 'club', seasonId: '2026_2027',
    teamSeason: { teamSignalSummary: summary }, leagueTeam: { teamSignalSummary: summary },
    leaguesCenterTeam: { teamSignalSummary: summary }, clubsCenterTeam: { teamSignalSummary: summary },
  }
  expect(compareTeamSignalSummaries(input)).toEqual([])
  expect(compareTeamSignalSummaries({ ...input, clubsCenterTeam: {} }))
    .toEqual([expect.objectContaining({ target: 'teamSignals', field: 'clubsCenter.teamSignalSummary' })])
  expect(compareTeamSignalSummaries({
    ...input, teamSeason: { teamSignalSummary: { ...summary, calibrationVersion: 'old' } },
  })).toEqual(expect.arrayContaining([
    expect.objectContaining({ field: 'teamSignalSummary.version', clubId: 'club' }),
  ]))
})
