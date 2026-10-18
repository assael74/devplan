// src/features/playersDatabase/services/audit/stats/arrivalHistory.audit.test.js

import { buildArrivalHistory } from '../../../domain/movement/arrivalHistory.projection.js'
import { compareArrivalHistory } from './arrivalHistory.audit.js'

const source = {
  identity: { teamId: 'team-a', seasonId: '2025_2026', teamSeasonDocumentId: 'team-a__2025_2026' },
  roster: { playersById: { p1: {} } },
  stats: { playersById: { p1: { lineClassification: { line: 'ATTACK' } } } },
  scouting: { playersById: { p1: { primary: { profileId: 'clear_scorer' } } } },
}
const fact = { movementId: 'move-1', playerId: 'p1', fromTeamId: 'team-a' }
const history = buildArrivalHistory({
  movementId: 'move-1', playerId: 'p1', fromTeamId: 'team-a',
  seasonId: '2026_2027', sourceTeamSeason: source,
})
const destination = entry => ({
  identity: { teamSeasonDocumentId: 'team-b__2026_2027', seasonId: '2026_2027' },
  movement: { transfersInById: { 'move-1': fact }, arrivalHistoryById: entry ? { 'move-1': entry } : {} },
})

test('reports stale arrival history when its source changes', () => {
  const changed = {
    ...source,
    stats: { playersById: { p1: { lineClassification: { line: 'MIDFIELD' } } } },
  }
  expect(compareArrivalHistory({
    teamSeason: destination(history),
    sourcesById: { 'team-a__2025_2026': changed },
  })).toMatchObject([{ target: 'arrivalHistory', type: 'projection_mismatch' }])
})

test('does not flag a missing source or a legacy transfer without history', () => {
  expect(compareArrivalHistory({ teamSeason: destination(history) })).toEqual([])
  expect(compareArrivalHistory({
    teamSeason: destination(null),
    sourcesById: { 'team-a__2025_2026': source },
  })).toEqual([])
})
