// src/shared/scouting/teams/clubComparison/clubComparison.test.js

import { buildClubCohortComparison } from './index.js'

const team = (birthYear, patch = {}) => ({
  teamId: `team-${birthYear}`, clubId: 'club', seasonId: '2025_2026', birthYear, teamSlot: 1,
  games: 8, leagueLevel: 2, successRate: 50, offense: 2, defense: 2,
  profilesAvailable: true, rosterCount: 20, professionalRate: 40, underuseRate: 20,
  ...patch,
})
const compare = (patch = {}, peers = [team(2011), team(2010), team(2009)]) => (
  buildClubCohortComparison({ clubId: 'club', seasonId: '2026_2027', teams: [team(2012, { seasonId: '2026_2027', ...patch }), ...peers] }).rows
    .find(row => row.birthYear === 2012)
)

test.each([
  ['leagueLevel', 1, 1.01], ['leagueLevel', 3, 2.99],
  ['successRate', 65, 64.99], ['successRate', 35, 35.01],
  ['offense', 4, 3], ['defense', 0, 1],
  ['professionalRate', 55, 54.99], ['professionalRate', 25, 25.01],
  ['underuseRate', 35, 34.99], ['underuseRate', 5, 5.01],
])('%s includes the threshold in either direction without rounding inputs', (key, at, below) => {
  expect(compare({ [key]: at }).metrics[key].isAnomaly).toBe(true)
  expect(compare({ [key]: below }).metrics[key].isAnomaly).toBe(false)
})

test('uses the historical median, including the midpoint of an even sample', () => {
  const target = compare({ successRate: 99 }, [
    team(2011, { successRate: 0 }), team(2010, { successRate: 40 }),
    team(2009, { successRate: 60 }), team(2008, { successRate: 100 }),
  ])
  expect(target.metrics.successRate).toMatchObject({ reference: 50, delta: 49, peerCount: 4 })
  expect(target.metrics.successRate.peerTeamIds).not.toContain('team-2012')
})

test('counts independent families rather than correlated metrics', () => {
  expect(compare({ successRate: 80, offense: 4, defense: 0 })).toMatchObject({
    signalLevel: 1, status: 'single', families: ['performance'],
  })
  expect(compare({ successRate: 80, offense: 4, professionalRate: 60, underuseRate: 0 })).toMatchObject({
    signalLevel: 2, status: 'multiple', families: ['performance', 'squad'],
  })
  expect(compare()).toMatchObject({ signalLevel: 0, status: 'none', availability: 'available' })
})

test('profile rate requires both 15 percentage points and an equivalent three-player gap', () => {
  expect(compare({ rosterCount: 10, professionalRate: 55 }).metrics.professionalRate.isAnomaly).toBe(false)
  expect(compare({ rosterCount: 10, professionalRate: 70 }).metrics.professionalRate.isAnomaly).toBe(true)
  expect(compare({ rosterCount: 100, professionalRate: 50 }).metrics.professionalRate.isAnomaly).toBe(false)
})

test('success compares only equal league levels and each metric has its own peer sample', () => {
  const target = compare({ successRate: 90 }, [team(2011), team(2010), team(2009, { leagueLevel: 1 })])
  expect(target.metrics.successRate).toMatchObject({ availability: 'unavailable', reason: 'insufficient_peers', peerCount: 2 })
  expect(target.metrics.offense.peerCount).toBe(3)
  expect(target.status).toBe('limited')
})

test('ignores other clubs, seasons, secondary teams and ambiguous cohorts', () => {
  const target = compare({}, [
    team(2011), team(2010), team(2009, { teamSlot: 2 }),
    team(2008, { clubId: 'other' }), team(2007, { seasonId: '2026_2027' }),
    team(2006), team(2006, { teamId: 'duplicate' }),
  ])
  expect(target.metrics.leagueLevel).toMatchObject({ reason: 'insufficient_peers', peerCount: 2 })
  expect(target.status).toBe('limited')
})

test.each([
  [{ games: 7 }, 'insufficient_games'], [{ games: null }, 'missing_games'],
  [{ seasonStatus: 'not_started' }, 'season_not_started'],
])('missing or early sample does not block league comparison: %s', (patch, reason) => {
  const target = compare({ ...patch, leagueLevel: 1 })
  expect(target.metrics.offense.reason).toBe(reason)
  expect(target).toMatchObject({ signalLevel: 1, status: 'single', availability: 'partial' })
})

test('explicit zero profiles is valid, missing profiles cannot become zero', () => {
  expect(compare({ professionalRate: 0 }).metrics.professionalRate.isAnomaly).toBe(true)
  expect(compare({ profilesAvailable: false, professionalRate: 0 }).metrics.professionalRate)
    .toMatchObject({ isAnomaly: false, reason: 'profiles_unavailable' })
  expect(compare({ offense: null }).metrics.offense).toMatchObject({ isAnomaly: false, reason: 'missing_value' })
})

test('includes the target cohort history and excludes all current and future observations', () => {
  const target = compare({ successRate: 80 }, [
    team(2012, { successRate: 40 }), team(2011, { successRate: 50 }), team(2010, { successRate: 60 }),
    team(2009, { seasonId: '2026_2027', successRate: 100 }),
    team(2008, { seasonId: '2027_2028', successRate: 100 }),
    team(2007, { seasonId: 'invalid', successRate: 100 }),
  ])
  expect(target.metrics.successRate).toMatchObject({ reference: 50, peerCount: 3, cohortCount: 3 })
  expect(target.metrics.successRate.referenceKeys).toContain('team-2012:2025_2026')
  expect(target.metrics.successRate.seasonIds).toEqual(['2025_2026'])
})

test('counts distinct cohorts across seasons, deduplicates documents and preserves each historical season', () => {
  const target = compare({}, [
    team(2012), team(2012), team(2012, { seasonId: '2024_2025' }),
    team(2011), team(2010),
  ])
  expect(target.metrics.successRate).toMatchObject({ reference: 50, peerCount: 4, cohortCount: 3, availability: 'available' })
  const insufficient = compare({}, [
    team(2012), team(2012, { seasonId: '2024_2025' }), team(2012, { seasonId: '2023_2024' }),
  ])
  expect(insufficient.metrics.successRate).toMatchObject({ peerCount: 3, cohortCount: 1, reason: 'insufficient_peers' })
})

test('selected historical season only uses seasons preceding it', () => {
  const result = buildClubCohortComparison({
    clubId: 'club', seasonId: '2025_2026', teams: [
      team(2012), team(2011, { seasonId: '2024_2025' }), team(2010, { seasonId: '2024_2025' }),
      team(2009, { seasonId: '2024_2025' }), team(2008, { seasonId: '2026_2027' }),
    ],
  })
  expect(result.rows).toHaveLength(1)
  expect(result.referenceRows).toHaveLength(3)
  expect(result.rows[0].metrics.successRate.seasonIds).toEqual(['2024_2025'])
})
