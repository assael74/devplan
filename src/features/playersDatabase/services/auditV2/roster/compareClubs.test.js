import { compareRosterClubsV2 } from './compareClubs.js'

const expected = [{
  clubId: 'club-a', ageGroupId: 'u15', seasonKey: '26_27', teamId: 'team-a',
  fields: { teamId: 'team-a', teamSlot: 1, seasonKey: '26_27', playersCount: 20, transfers: { coverageStatus: 'not_loaded' } },
}]
const season = { ...expected[0].fields, performance: { goalsFor: 99 }, scoutProfilesSummary: { total: 8 } }

describe('compareRosterClubsV2', () => {
  test('ignores non-Roster Club and Clubs Master fields', () => {
    const result = compareRosterClubsV2({ expectedClubs: expected, actual: {
      clubs: [{ clubId: 'club-a', club: { ageGroups: [{ ageGroupId: 'u15', seasons: [season] }] } }],
      clubsMaster: { clubs: [{ clubId: 'club-a', ageGroups: [{ ageGroupId: 'u15', current: [season], previous: [] }], clubLevel: 9 }] },
    } })
    expect(result.clubFindings).toEqual([])
    expect(result.masterFindings).toEqual([])
  })

  test('reports missing roster-owned Club projection', () => {
    const result = compareRosterClubsV2({ expectedClubs: expected, actual: { clubs: [{ clubId: 'club-a', club: {} }], clubsMaster: { clubs: [] } } })
    expect(result.clubFindings[0]).toEqual(expect.objectContaining({ type: 'missing_projection', target: 'club' }))
    expect(result.masterFindings[0]).toEqual(expect.objectContaining({ type: 'missing_projection', target: 'clubsMaster' }))
  })

  test('reports real playersCount mismatch', () => {
    const result = compareRosterClubsV2({ expectedClubs: expected, actual: {
      clubs: [{ clubId: 'club-a', club: { ageGroups: [{ ageGroupId: 'u15', seasons: [{ ...season, playersCount: 19 }] }] } }],
      clubsMaster: { clubs: [{ clubId: 'club-a', ageGroups: [{ ageGroupId: 'u15', current: [{ ...season, playersCount: 19 }], previous: [] }] }] },
    } })
    expect(result.clubFindings[0].type).toBe('projection_mismatch')
    expect(result.masterFindings[0].type).toBe('projection_mismatch')
  })
})
