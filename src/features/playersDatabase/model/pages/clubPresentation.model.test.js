// src/features/playersDatabase/model/pages/clubPresentation.model.test.js

import { getClubCollapseView } from '../../domain/clubIntelligence/index.js'
import { buildTeamSignalSummary, hasActiveTeamSignals } from '../../domain/signals/teamSignalSummary.js'
import { buildClubCollapseSignalCardsModel, buildClubPageModel, buildClubSummaryModel } from './clubPresentation.model.js'

const summaryFor = (id, level = 1) => buildTeamSignalSummary({
  computedAt: '2026-10-18T12:00:00.000Z',
  familiesById: { [id]: { level, availability: 'available' } },
})
const currentTeam = {
  teamId: 'club_2012_1', teamSlot: 1, birthYear: 2012, ageGroupId: 'u15',
  ageGroupLabel: 'נערים ג', seasonKey: '26/27', league: { leagueId: 'league', leagueLevel: 2 },
  performance: {}, teamSignalSummary: summaryFor('future-competition'),
}
const intelligence = {
  club: { clubId: 'club', clubLevel: 1 },
  birthYearTeams: [{ birthYear: 2012, seasons: {
    current: { teams: [currentTeam] },
    previous: { teams: [{ ...currentTeam, seasonKey: '25/26', teamSignalSummary: summaryFor('performance', 2) }] },
  } }],
  signalCoverage: { futureLeaguePath: { status: 'partial', reasons: [
    { ageGroup: { ageGroupId: 'u14' }, reason: 'source_focus_team_missing' },
  ] } },
}

test('aggregates independent families from current summaries without old spotlight outputs', () => {
  const next = { ...intelligence, birthYearTeams: [...intelligence.birthYearTeams, {
    birthYear: 2013, seasons: { current: { teams: [{
      ...currentTeam, teamId: 'club_2013_1', ageGroupId: 'u14', birthYear: 2013,
      teamSignalSummary: summaryFor('roster-balance', 2),
    }] }, previous: { teams: [] } },
  }] }
  const result = buildClubSummaryModel({ intelligence: next })
  expect(result.teamSignalSummary.familiesById['future-competition'].level).toBe(1)
  expect(result.teamSignalSummary.familiesById['roster-balance'].level).toBe(2)
  expect(result.teamSignalSummary.familiesById.performance.level).toBeNull()
  expect(hasActiveTeamSignals(result.teamSignalSummary)).toBe(true)
  expect(result).not.toHaveProperty('primarySpotlight')
  expect(result).not.toHaveProperty('spotlights')
  expect(result).not.toHaveProperty('mismatch')
})

test('legacy task flags cannot create signals when the compact summary is missing', () => {
  const oldTeam = { ...currentTeam, teamSignalSummary: undefined, teamTaskSignals: { offense: true, defense: true } }
  const result = buildClubSummaryModel({ intelligence: {
    ...intelligence, birthYearTeams: [{ seasons: { current: { teams: [oldTeam] }, previous: { teams: [] } } }],
  } })
  expect(hasActiveTeamSignals(result.teamSignalSummary)).toBe(false)
  expect(result.teamSignalSummary.familiesById['roster-balance'].level).toBeNull()
})

test('stale calibration stays unknown rather than becoming an active club signal', () => {
  const stale = { ...currentTeam, teamSignalSummary: { ...currentTeam.teamSignalSummary, calibrationVersion: 'old' } }
  const result = buildClubSummaryModel({ intelligence: {
    ...intelligence, birthYearTeams: [{ seasons: { current: { teams: [stale] }, previous: { teams: [] } } }],
  } })
  expect(hasActiveTeamSignals(result.teamSignalSummary)).toBe(false)
})

test('keeps u14 and u15 first, uses primary teams, and preserves focus coverage and investigation markers', () => {
  const view = getClubCollapseView(intelligence)
  const cards = buildClubCollapseSignalCardsModel({
    teams: [{ ...currentTeam, teamSlot: 2, teamSignalSummary: summaryFor('performance', 2) },
      { ...currentTeam, showInvestigationIndicator: true }],
    signalCoverage: view.signalCoverage, seasonKey: '26/27',
  })
  expect(cards.map(card => card.id)).toEqual(['u14', 'u15', 'u16', 'u17', 'u19'])
  expect(cards[0]).toMatchObject({ birthYear: 2013, teamSignalSummary: null, coverage: { title: 'חסר כיסוי' } })
  expect(cards[1]).toMatchObject({
    teamSignalSummary: currentTeam.teamSignalSummary, showInvestigationIndicator: true,
    context: { leagueLevel: 2 },
  })
  expect(cards[1]).not.toHaveProperty('signal')
  expect(view.currentPrimaryTeams).toEqual([currentTeam])
})

test('uses current and previous summaries in their own club page sections', () => {
  const page = buildClubPageModel({ intelligence })
  expect(page.overview.teamSignalSummary.familiesById['future-competition'].level).toBe(1)
  expect(page.opportunities[0].teamSignalSummary).toBe(currentTeam.teamSignalSummary)
  expect(page.seasons.find(season => season.seasonKey === '25/26').teamSignalSummary.familiesById.performance.level).toBe(2)
  expect(page.development[0].birthYear).toBe(2012)
  expect(page.development[0].teams).toEqual([
    expect.objectContaining({ teamId: currentTeam.teamId, seasonKey: '25/26', leagueLevel: 2 }),
    expect.objectContaining({ teamId: currentTeam.teamId, seasonKey: '26/27', leagueLevel: 2 }),
  ])
})
