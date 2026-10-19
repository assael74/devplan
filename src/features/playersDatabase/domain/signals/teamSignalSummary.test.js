// src/features/playersDatabase/domain/signals/teamSignalSummary.test.js

import {
  TEAM_SIGNAL_FAMILIES,
  buildTeamSignalSummary,
  countTeamSignalFamilies,
  countTeamSignalStrengths,
  groupTeamsByResearchWork,
  groupTeamsByStrongSignalCount,
  groupTeamsByStrongSignalMinimum,
  readTeamStrongSignalCount,
} from './teamSignalSummary.js'

const summary = (level, availability = 'available') => buildTeamSignalSummary({
  familiesById: { 'roster-balance': { level, availability } },
})

test('counts teams per family and keeps the strongest level without summing levels', () => {
  const result = countTeamSignalFamilies([summary(1), summary(2), summary(0)])['roster-balance']
  expect(result).toMatchObject({ activeTeamCount: 2, maxLevel: 2, availability: 'available' })
})

test('missing and stale summaries cannot become zero known signals', () => {
  const stale = { ...summary(2), calibrationVersion: 'old' }
  expect(countTeamSignalFamilies([null, stale])['roster-balance']).toMatchObject({
    activeTeamCount: null, maxLevel: null, availability: 'unavailable', missingTeamCount: 2,
  })
  expect(countTeamSignalFamilies([summary(0), null])['roster-balance']).toMatchObject({
    activeTeamCount: null, maxLevel: null, availability: 'partial',
  })
  expect(countTeamSignalFamilies([summary(0)])['roster-balance']).toMatchObject({
    activeTeamCount: 0, maxLevel: 0, availability: 'available',
  })
})

test('proven signals survive partial coverage while the incomplete count remains explicit', () => {
  expect(countTeamSignalFamilies([summary(1, 'partial'), null])['roster-balance']).toMatchObject({
    activeTeamCount: 1, maxLevel: 1, availability: 'partial', partialTeamCount: 1, missingTeamCount: 1,
  })
})

const coveredWithoutSignals = () => buildTeamSignalSummary({
  familiesById: Object.fromEntries(TEAM_SIGNAL_FAMILIES.map(({ id }) => [
    id, { level: 0, availability: 'available' },
  ])),
})

const strongFamilies = count => buildTeamSignalSummary({
  familiesById: Object.fromEntries(TEAM_SIGNAL_FAMILIES.slice(0, count).map(({ id }) => [
    id, { level: 2, availability: 'partial' },
  ])),
})

test('minimum thresholds include higher counts and pending excludes only explicitly marked teams', () => {
  const teams = [1, 2, 3, 4, 5].map(count => ({
    id: String(count), teamSignalSummary: strongFamilies(count), showInvestigationIndicator: count % 2 === 1,
  }))
  const before = JSON.stringify(teams)
  const groups = groupTeamsByStrongSignalMinimum(teams)
  expect(groups.strongMin1).toEqual(teams)
  expect(groups.strongMin2).toEqual(teams.slice(1))
  expect(groups.strongMin3).toEqual(teams.slice(2))
  expect(groups.strongMin1Pending).toEqual([teams[1], teams[3]])
  expect(groups.strongMin2Pending).toEqual([teams[1], teams[3]])
  expect(groups.strongMin3Pending).toEqual([teams[3]])
  expect(groups.strongMin3[0]).toBe(teams[2])
  expect(JSON.stringify(teams)).toBe(before)
})

test('minimum groups exclude unknown, stale and watch-only teams even if unmarked', () => {
  const teams = [summary(1), null, { ...summary(2), modelVersion: 'old' }]
    .map(teamSignalSummary => ({ teamSignalSummary }))
  expect(Object.values(groupTeamsByStrongSignalMinimum(teams)).flat()).toEqual([])
  const team = { teamSignalSummary: strongFamilies(2) }
  expect(groupTeamsByStrongSignalMinimum([team]).strongMin2Pending).toEqual([team])
})

test('groups exact strong family counts and keeps investigation marks within each category', () => {
  const teams = [1, 2, 3, 4, 5].map(count => ({
    id: String(count), teamSignalSummary: strongFamilies(count), showInvestigationIndicator: count % 2 === 1,
  }))
  const before = JSON.stringify(teams)
  const groups = groupTeamsByStrongSignalCount(teams)
  expect(groups.strong1).toEqual([teams[0]])
  expect(groups.strong2).toEqual([teams[1]])
  expect(groups.strong3Plus).toEqual(teams.slice(2))
  expect(groups.strong1Marked).toEqual([teams[0]])
  expect(groups.strong2Marked).toEqual([])
  expect(groups.strong3PlusMarked).toEqual([teams[2], teams[4]])
  expect(groups.strong1[0]).toBe(teams[0])
  expect(JSON.stringify(teams)).toBe(before)
})

test('strong family counts exclude watch, absent and incompatible summaries', () => {
  const summaries = [summary(1), coveredWithoutSignals(), null, { ...summary(2), calibrationVersion: 'old' }]
  expect(summaries.map(readTeamStrongSignalCount)).toEqual([0, 0, 0, 0])
  const groups = groupTeamsByStrongSignalCount(summaries.map(teamSignalSummary => ({
    teamSignalSummary, showInvestigationIndicator: true,
  })))
  expect(Object.values(groups).flat()).toEqual([])
})

test('counts every team exactly once using its strongest proven family', () => {
  const mixed = buildTeamSignalSummary({ familiesById: {
    performance: { level: 2, availability: 'partial' },
    'roster-balance': { level: 2, availability: 'available' },
    'club-gap': { level: 1, availability: 'partial' },
  } })
  const summaries = [mixed, summary(1, 'partial'), coveredWithoutSignals(), null]
  const counts = countTeamSignalStrengths(summaries)
  expect(counts).toEqual({ strong: 1, watch: 1, none: 1, uncovered: 1 })
  expect(Object.values(counts).reduce((sum, count) => sum + count, 0)).toBe(summaries.length)
})

test('no signal requires full known coverage of all five families', () => {
  expect(countTeamSignalStrengths([summary(0)])).toEqual({ strong: 0, watch: 0, none: 0, uncovered: 1 })
  const incomplete = coveredWithoutSignals()
  incomplete.familiesById.performance = { level: null, availability: 'partial' }
  expect(countTeamSignalStrengths([incomplete])).toEqual({ strong: 0, watch: 0, none: 0, uncovered: 1 })
})

test('missing or incompatible summaries count as uncovered rather than known absence', () => {
  const modelMismatch = { ...coveredWithoutSignals(), modelVersion: 'old' }
  const calibrationMismatch = { ...summary(2), calibrationVersion: 'old' }
  expect(countTeamSignalStrengths([undefined, modelMismatch, calibrationMismatch])).toEqual({
    strong: 0, watch: 0, none: 0, uncovered: 3,
  })
  expect(countTeamSignalStrengths()).toEqual({ strong: 0, watch: 0, none: 0, uncovered: 0 })
})

test('research work groups combine strongest signal with the independent manual investigation mark', () => {
  const teams = [
    { id: 'strong-pending', teamSignalSummary: summary(2, 'partial') },
    { id: 'watch-pending', teamSignalSummary: summary(1) },
    { id: 'strong-marked', teamSignalSummary: summary(2), showInvestigationIndicator: true },
    { id: 'watch-marked', teamSignalSummary: summary(1), showInvestigationIndicator: true },
    { id: 'missing', teamSignalSummary: null },
    { id: 'missing-marked', teamSignalSummary: null, showInvestigationIndicator: true },
    { id: 'quiet', teamSignalSummary: coveredWithoutSignals() },
    { id: 'quiet-marked', teamSignalSummary: coveredWithoutSignals(), showInvestigationIndicator: true },
  ]
  const before = JSON.stringify(teams)
  const groups = groupTeamsByResearchWork(teams)
  expect(groups.pendingStrong).toEqual([teams[0]])
  expect(groups.pendingWatch).toEqual([teams[1]])
  expect(groups.markedInvestigation).toEqual([teams[2], teams[3]])
  expect(groups.missingSignalInformation).toEqual([teams[4], teams[5]])
  expect(new Set(Object.values(groups).flat()).size).toBe(6)
  expect(JSON.stringify(teams)).toBe(before)
})

test('marking a proven signal moves it from pending work to marked investigation', () => {
  const team = { teamSignalSummary: summary(2) }
  expect(groupTeamsByResearchWork([team]).pendingStrong).toEqual([team])
  const marked = { ...team, showInvestigationIndicator: true }
  const next = groupTeamsByResearchWork([marked])
  expect(next.pendingStrong).toEqual([])
  expect(next.markedInvestigation).toEqual([marked])
})
