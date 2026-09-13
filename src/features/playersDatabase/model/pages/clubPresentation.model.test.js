import {
  buildClubSummaryModel,
} from './clubPresentation.model.js'

const team = ({ teamId, ageGroupId, birthYear, leagueLevel }) => ({
  teamId,
  ageGroupId,
  birthYear,
  league: { leagueLevel },
  performance: {},
})

describe('Club presentation model', () => {
  test('keeps a missing league level in the primary path and separates slot two', () => {
    const model = buildClubSummaryModel({
      club: { clubLevel: 1 },
      teams: [
        team({ teamId: 'club_2012_1', ageGroupId: 'u15', birthYear: 2012, leagueLevel: 1 }),
        team({ teamId: 'club_2011_1', ageGroupId: 'u16', birthYear: 2011, leagueLevel: 2 }),
        team({ teamId: 'club_2010_1', ageGroupId: 'u17', birthYear: 2010, leagueLevel: null }),
        team({ teamId: 'club_2012_2', ageGroupId: 'u15', birthYear: 2012, leagueLevel: 3 }),
      ],
      seasonKey: '26/27',
    })

    expect(model.leaguePath.primary.map(item => item.label)).toEqual(['1', '2', '?', '?'])
    expect(model.leaguePath.primary.map(item => item.birthYear)).toEqual([2012, 2011, 2010, 2008])
    expect(model.leaguePath.secondary).toEqual([
      expect.objectContaining({
        slot: 2,
        path: [expect.objectContaining({ ageGroupId: 'u15', label: '3' })],
      }),
    ])
  })

  test('uses the flat Clubs Master league level in the path', () => {
    const model = buildClubSummaryModel({
      club: { clubLevel: 1 },
      seasonKey: '26/27',
      teams: [{
        teamId: 'club_2012_1',
        ageGroupId: 'u15',
        leagueLevel: 2,
        performance: {},
      }],
    })

    expect(model.leaguePath.primary[0]).toMatchObject({ birthYear: 2012, label: '2' })
  })

  test('counts only primary teams with the opposite league level as a mismatch', () => {
    const model = buildClubSummaryModel({
      club: { clubLevel: 1 },
      teams: [
        team({ teamId: 'club_2012_1', ageGroupId: 'u15', birthYear: 2012, leagueLevel: 2 }),
        team({ teamId: 'club_2011_1', ageGroupId: 'u16', birthYear: 2011, leagueLevel: 1 }),
        team({ teamId: 'club_2010_2', ageGroupId: 'u17', birthYear: 2010, leagueLevel: 2 }),
      ],
    })

    expect(model.mismatch).toEqual({
      key: 'mismatch',
      label: 'חריגת רמת ליגה',
      count: 1,
      ageGroups: ['נערים ג'],
      teams: [{
        ageGroupLabel: 'נערים ג',
        birthYear: 2012,
        leagueLevel: 2,
        levelRelation: 'below',
      }],
    })
  })

  test('includes half-level club strength and level two-or-higher clubs', () => {
    const teams = [
      team({ teamId: 'club_2012_1', ageGroupId: 'u15', birthYear: 2012, leagueLevel: 2 }),
      team({ teamId: 'club_2011_1', ageGroupId: 'u16', birthYear: 2011, leagueLevel: 1 }),
    ]

    expect(buildClubSummaryModel({ club: { clubStrengthLevel: 1.5 }, teams }).mismatch.count)
      .toBe(1)
    expect(buildClubSummaryModel({ club: { clubStrengthLevel: 2.5 }, teams }).mismatch.count)
      .toBe(2)
  })
})
