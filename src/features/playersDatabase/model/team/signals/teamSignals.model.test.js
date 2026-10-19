// src/features/playersDatabase/model/team/signals/teamSignals.model.test.js

import { buildTeamSignals } from './teamSignals.model.js'
import { buildClubTeamSignalStates } from './teamSignalSources.model.js'
import { buildTeamSignalSummary, readTeamSignalSummary } from '../../../domain/signals/teamSignalSummary.js'
import { TEAM_SIGNAL_CALIBRATION } from '../../../../../shared/scouting/teams/signals/teamSignalCalibration.js'

const build = (view = {}, club = {}, clubIntelligence = null) => buildTeamSignals({ view, club, clubIntelligence })

test('missing source data stays unknown and is never projected as zero', () => {
  const result = build()
  expect(Object.keys(result.summary.familiesById)).toHaveLength(5)
  Object.values(result.summary.familiesById).forEach(family => expect(family.level).toBeNull())
  expect(result.summary.calibrationVersion).toBe(TEAM_SIGNAL_CALIBRATION.version)
})

test('balance counts independent lines once and includes classification checks', () => {
  const structure = {
    availability: 'available',
    teamInterest: { lines: {
      offense: { finding: 'ATTACK_DEPTH_REVIEW', isInteresting: true },
      defense: { finding: 'DEFENSE_CLASSIFICATION_MISSING', isInteresting: true },
    }, squad: { isInteresting: false } },
  }
  const result = build({ structure })
  expect(result.summary.familiesById['roster-balance']).toEqual({ level: 2, availability: 'available' })
  expect(Object.keys(result.familiesById['roster-balance'].signalsById)).toEqual(['offense', 'defense', 'squad'])
})

test('a missing squad analysis does not make a known line look like complete roster coverage', () => {
  const result = build({ structure: {
    availability: 'available',
    teamInterest: { lines: { offense: { finding: 'ATTACK_DEPTH_REVIEW', isInteresting: true } } },
  } })
  expect(result.summary.familiesById['roster-balance']).toEqual({ level: 1, availability: 'partial' })
  expect(result.familiesById['roster-balance'].signalsById.squad)
    .toMatchObject({ level: null, availability: 'unavailable' })
  expect(build({ structure: {} }).summary.familiesById['roster-balance'])
    .toEqual({ level: null, availability: 'unavailable' })
})

test('an absent signal availability is missing evidence rather than partial coverage', () => {
  expect(build({ performanceInsight: { signals: [{ id: 'uncomputed', level: null }] } })
    .summary.familiesById.performance).toEqual({ level: null, availability: 'unavailable' })
})

test('movement threshold is strict and both proven signals raise the family to two', () => {
  const season = {
    seasonKey: '26/27', movementDataAvailable: true, outgoingPlayerCount: 4,
    higherLevelDepartures: 3, professionalProfileDepartures: 3, comparableDepartures: 4, profileKnownDepartures: 4,
  }
  const view = { selectedSeasonKey: '26/27', yearDevelopment: { movementSeasons: [season] } }
  expect(build(view, { clubLevel: 2 }).summary.familiesById['year-movements'].level).toBe(2)
  expect(build(view, { clubLevel: 1.5 }).summary.familiesById['year-movements'].level).toBe(0)
})

test('a proven signal survives incomplete coverage while an unproven absence remains null', () => {
  const season = {
    seasonKey: '26/27', movementDataAvailable: true, outgoingPlayerCount: 4,
    higherLevelDepartures: 3, professionalProfileDepartures: 0, comparableDepartures: 3, profileKnownDepartures: 0,
  }
  const view = { selectedSeasonKey: '26/27', yearDevelopment: { movementSeasons: [season] } }
  expect(build(view, { clubLevel: 2 }).summary.familiesById['year-movements'])
    .toEqual({ level: 1, availability: 'partial' })
  expect(build(view, { clubLevel: 1.5 }).summary.familiesById['year-movements'])
    .toEqual({ level: null, availability: 'partial' })
})

test('club-level mismatch and one historical domain do not count as two historical domains', () => {
  const view = { team: { id: 'club_2012_1', clubId: 'club', teamSlot: 1, leagueLevel: 3 } }
  const intelligence = { cohortComparison: { clubId: 'club', rows: [{
    teamId: view.team.id, signalLevel: 1,
    metrics: { offense: { key: 'offense', family: 'performance', isAnomaly: true, availability: 'available' } },
  }] } }
  expect(build(view, { clubLevel: 1 }, intelligence).summary.familiesById['club-gap'].level).toBe(1)
  intelligence.cohortComparison.rows[0].signalLevel = 2
  expect(build(view, { clubLevel: 1 }, intelligence).summary.familiesById['club-gap'].level).toBe(2)
})

test('old calibration results are not rendered as current signals', () => {
  const summary = buildTeamSignalSummary({ familiesById: { performance: { level: 2, availability: 'available' } } })
  expect(readTeamSignalSummary(summary).familiesById.performance.level).toBe(2)
  expect(readTeamSignalSummary({ ...summary, calibrationVersion: 'old' }).familiesById.performance.level).toBeNull()
})

test('league-only canonical inputs support early signals without requiring a Team Season', () => {
  const teamId = 'club_2012_1'
  const league = {
    id: 'league', leagueId: 'league', level: 3,
    seasonsById: {
      '2025_2026': { seasonKey: '25/26', birthYear: 2012, seasonStatus: 'completed', table: { teamsById: {
        [teamId]: { clubId: 'club', teamSlot: 1, officialTable: { rank: 10, teamGamePlayed: 16 }, performance: {} },
      } } },
      '2026_2027': { seasonKey: '26/27', birthYear: 2012, seasonStatus: 'active', table: { teamsById: {
        [teamId]: { clubId: 'club', teamSlot: 1, officialTable: { rank: 2, teamGamePlayed: 16 }, performance: {} },
      } } },
    },
  }
  const result = buildClubTeamSignalStates({ clubId: 'club', profilesById: { club: { clubLevel: 1 } }, leagues: [league] })
  const current = result.find(row => row.seasonId === '2026_2027')
  expect(current.teamSeasonDocumentId).toBe('')
  expect(current.state.summary.familiesById.performance.level).toBe(2)
  expect(current.state.summary.familiesById['club-gap'].level).toBe(1)
  expect(current.state.summary.familiesById['roster-balance'].level).toBeNull()
})
