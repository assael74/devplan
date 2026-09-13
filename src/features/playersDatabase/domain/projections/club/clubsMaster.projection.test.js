import {
  buildClubsMasterAgeGroupEntry,
} from './clubsMaster.projection.js'

const season = ({
  seasonKey,
  seasonStatus,
  teamId = 'team-1',
  leagueId = 'league-1',
} = {}) => ({
  seasonId: seasonKey,
  seasonKey,
  seasonStatus,
  teamId,
  league: { leagueId, leagueName: leagueId, leagueLevel: 1 },
})

const buildEntry = seasons => buildClubsMasterAgeGroupEntry({
  ageGroupId: 'u15',
  ageGroupLabel: 'U15',
  seasons,
})

const keysOf = rows => rows.map(row => row.seasonKey)

describe('Clubs Master age-group season selection', () => {
  test('selects only catalog current and previous seasons', () => {
    const entry = buildEntry([
      season({ seasonKey: '24/25', seasonStatus: 'completed' }),
      season({ seasonKey: '25/26', seasonStatus: 'completed' }),
      season({ seasonKey: '26/27', seasonStatus: 'not_started' }),
    ])

    expect(keysOf(entry.current)).toEqual(['26/27'])
    expect(keysOf(entry.previous)).toEqual(['25/26'])
  })

  test('does not let an active non-catalog season replace catalog current', () => {
    const entry = buildEntry([
      season({ seasonKey: '26/27', seasonStatus: 'not_started' }),
      season({ seasonKey: '25/26', seasonStatus: 'active' }),
      season({ seasonKey: '24/25', seasonStatus: 'completed' }),
    ])

    expect(keysOf(entry.current)).toEqual(['26/27'])
    expect(keysOf(entry.previous)).toEqual(['25/26'])
  })

  test('uses the catalog current season when no active season exists', () => {
    const entry = buildEntry([
      season({ seasonKey: '25/26', seasonStatus: 'completed' }),
      season({ seasonKey: '26/27', seasonStatus: 'not_started' }),
    ])

    expect(keysOf(entry.current)).toEqual(['26/27'])
    expect(keysOf(entry.previous)).toEqual(['25/26'])
  })

  test('leaves current empty when catalog current does not exist', () => {
    const entry = buildEntry([
      season({ seasonKey: '23/24', seasonStatus: 'completed' }),
      season({ seasonKey: '25/26', seasonStatus: 'completed' }),
      season({ seasonKey: '24/25', seasonStatus: 'completed' }),
    ])

    expect(entry.current).toEqual([])
    expect(keysOf(entry.previous)).toEqual(['25/26'])
  })

  test('keeps current empty when only previous season exists', () => {
    const entry = buildEntry([
      season({ seasonKey: '25/26', seasonStatus: 'completed' }),
    ])

    expect(entry.current).toEqual([])
    expect(keysOf(entry.previous)).toEqual(['25/26'])
  })

  test('is independent of input order and idempotent', () => {
    const seasons = [
      season({ seasonKey: '26/27', seasonStatus: 'active', teamId: 'team-b' }),
      season({ seasonKey: '26/27', seasonStatus: 'active', teamId: 'team-a' }),
      season({ seasonKey: '25/26', seasonStatus: 'completed' }),
    ]

    expect(buildEntry(seasons)).toEqual(buildEntry([...seasons].reverse()))
    expect(buildEntry(seasons)).toEqual(buildEntry(seasons))
  })

  test('keeps every team in the selected season without duplicate season selection', () => {
    const entry = buildEntry([
      season({ seasonKey: '26/27', seasonStatus: 'active', teamId: 'team-2' }),
      season({ seasonKey: '26/27', seasonStatus: 'active', teamId: 'team-1' }),
      season({ seasonKey: '25/26', seasonStatus: 'completed', teamId: 'team-0' }),
    ])

    expect(entry.current).toHaveLength(2)
    expect(entry.current.map(row => row.teamId)).toEqual(['team-1', 'team-2'])
    expect(keysOf(entry.previous)).toEqual(['25/26'])
  })
})
