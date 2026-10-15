// src/features/playersDatabase/ui/pages/teamPage/information/model/teamInformationDevelopment.model.test.js

import { buildDevelopmentTimeline, buildYearDevelopmentOverview } from './teamInformationDevelopment.model.js'

test('calculates season success percent from official points and games', () => {
  const timeline = buildDevelopmentTimeline({
    team: { points: 9, games: 5 },
    teamSeasons: [
      { seasonKey: '26/27', games: 12, teamStats: { points: 25, teamGamePlayed: 12 } },
      { seasonKey: '25/26', games: 10, teamStats: { points: 15, teamGamePlayed: 10 } },
      { seasonKey: '24/25', games: 0, teamStats: { points: 0, teamGamePlayed: 0 } },
    ],
    seasonOptions: [{ seasonKey: '26/27', target: 'current' }],
  })

  expect(timeline.map(season => [season.seasonKey, season.successPercent])).toEqual([
    ['26/27', 69],
    ['25/26', 50],
    ['24/25', null],
  ])
})

test('counts professional and underuse profiles per season without treating missing roster data as zero', () => {
  const timeline = buildDevelopmentTimeline({
    teamSeasons: [
      { seasonKey: '26/27', games: 8 },
      {
        seasonKey: '25/26',
        scoutProfilesSummary: { total: 3 },
        teamPlayers: [
          { playerId: 'core-1', professionalScoutProfileIds: ['last_station'] },
          { playerId: 'underuse-1', professionalScoutProfileIds: ['underused_prospect'] },
          { playerId: 'underuse-2', professionalScoutProfileIds: ['blocked_top_team'] },
        ],
      },
      { seasonKey: '24/25' },
    ],
    selectedSeasonKey: '26/27',
    selectedTeamSeason: {
      scoutProfilesSummary: { total: 3 },
      teamPlayers: [
        { playerId: 'core-1', professionalScoutProfileIds: ['last_station'] },
        { playerId: 'core-2', professionalScoutProfileIds: ['last_station'] },
        { playerId: 'underuse-1', professionalScoutProfileIds: ['underused_prospect'] },
        { playerId: 'left', rosterStatus: 'left', professionalScoutProfileIds: ['last_station'] },
      ],
    },
  })

  expect(timeline.map(season => [
    season.seasonKey, season.professionalProfiles, season.underuseProfiles,
  ])).toEqual([
    ['26/27', 2, 1],
    ['25/26', 1, 2],
    ['24/25', null, null],
  ])
})

test('separates profile distribution by identity and counts players once per group', () => {
  const overview = buildYearDevelopmentOverview({
    teamSeasons: [{
      seasonKey: '26/27',
      scoutProfilesSummary: {
        total: 3,
        profileCounts: {
          last_station: 2,
          secondary_threat: 1,
          underused_prospect: 2,
          legacy_profile: 1,
        },
      },
      teamPlayers: [
        { playerId: 'one', professionalScoutProfileIds: ['last_station', 'secondary_threat', 'underused_prospect'] },
        { playerId: 'two', professionalScoutProfileIds: ['last_station'] },
        { playerId: 'three', professionalScoutProfileIds: ['underused_prospect'] },
      ],
    }],
  })
  const season = overview.scoutProfileDistributionTimeline[0]

  expect(season.groupCounts).toEqual({ professional: 2, underuse: 2 })
  expect(season.profileGroups.map(group => [group.key, group.profiles.map(profile => profile.profileId)])).toEqual([
    ['professional', ['last_station', 'secondary_threat']],
    ['underuse', ['underused_prospect']],
    ['other', ['legacy_profile']],
  ])
})

test('highlights only a significant professional profile change from the preceding season', () => {
  const seasonWithProfiles = (seasonKey, profileCounts) => ({
    seasonKey,
    scoutProfilesSummary: {
      total: Object.values(profileCounts).reduce((total, count) => total + count, 0),
      profileCounts,
    },
    teamPlayers: Object.entries(profileCounts).flatMap(([profileId, count]) => (
      Array.from({ length: count }, (_, index) => ({
        playerId: `${profileId}-${index}`,
        professionalScoutProfileIds: [profileId],
      }))
    )),
  })
  const teamSeasons = [
    seasonWithProfiles('26/27', { last_station: 5, secondary_threat: 2, underused_prospect: 5 }),
    seasonWithProfiles('25/26', { last_station: 1, secondary_threat: 6, underused_prospect: 1 }),
  ]
  const overview = buildYearDevelopmentOverview({ teamSeasons, selectedSeasonKey: '26/27' })

  expect(overview.largestProfessionalProfileChange).toEqual({
    profileId: 'last_station', current: 5, previous: 1, delta: 4, seasonKey: '26/27',
  })

  const smallChange = buildYearDevelopmentOverview({
    teamSeasons: [
      seasonWithProfiles('26/27', { last_station: 3 }),
      seasonWithProfiles('25/26', { last_station: 1 }),
    ],
    selectedSeasonKey: '26/27',
  })
  expect(smallChange.largestProfessionalProfileChange).toBeNull()
})

test('shows incoming and outgoing movement with the documented level direction', () => {
  const overview = buildYearDevelopmentOverview({
    teamSeasons: [
      {
        seasonKey: '26/27',
        teamPlayers: [{
          playerId: 'joined', fullName: 'מצטרף', primaryPosition: 'DCR',
          lineClassification: { line: 'DEFENSE' },
          scoutProfiles: [{ profileId: 'last_station', depthPct: 58 }],
        }],
        transfersOut: [{
          movementId: 'out', playerId: 'left', levelDirection: 'down',
          fromClubId: 'current', toClubId: 'lower', toTeamId: 'lower_2012_1',
        }],
        transfersIn: [{
          movementId: 'in', playerId: 'joined', levelDirection: 'up',
          fromClubId: 'lower', toClubId: 'current', fromTeamId: 'lower_2012_1',
        }],
      },
      {
        seasonKey: '25/26',
        teamPlayers: [{ playerId: 'left', fullName: 'עוזב' }],
      },
    ],
    seasonOptions: [{ seasonKey: '26/27', target: 'current' }],
    clubsDirectory: {
      clubsById: {
        current: { clubLevel: 2, names: { display: 'קבוצה נוכחית' } },
        lower: { clubLevel: 4, names: { display: 'קבוצה אחרת' } },
      },
    },
  })
  const current = overview.movementSeasons.find(season => season.seasonKey === '26/27')

  expect(current.leftCount).toBe(1)
  expect(current.joinedCount).toBe(1)
  expect(current.directionCounts).toEqual({ down: 1, up: 1 })
  expect(current.movements).toEqual(expect.arrayContaining([
    expect.objectContaining({
      movementId: 'out', name: 'עוזב', side: 'out', direction: 'down',
      otherTeamName: 'קבוצה אחרת', levelChange: 2,
    }),
    expect.objectContaining({
      movementId: 'in', name: 'מצטרף', side: 'in', direction: 'up',
      otherTeamName: 'קבוצה אחרת', levelChange: 2,
      classification: { line: 'DEFENSE' },
      player: expect.objectContaining({ primaryPosition: 'DCR', scoutProfiles: expect.any(Array) }),
    }),
  ]))
})

test('shows a previously unknown move from a weaker club to a level-1 club second team', () => {
  const overview = buildYearDevelopmentOverview({
    teamSeasons: [{
      seasonKey: '26/27',
      transfersOut: [
        {
          movementId: 'up-to-second', levelDirection: 'unknown',
          fromClubId: 'lower', fromTeamId: 'lower_2012_1',
          toClubId: 'top', toTeamId: 'top_2012_2',
        },
        {
          movementId: 'same-level-to-second', levelDirection: 'unknown',
          fromClubId: 'peer', fromTeamId: 'peer_2012_1',
          toClubId: 'top', toTeamId: 'top_2012_2',
        },
      ],
    }],
    clubsDirectory: {
      clubsById: {
        top: { clubLevel: 1 },
        lower: { clubLevel: 3 },
        peer: { clubLevel: 1 },
      },
    },
  })

  expect(overview.movementSeasons[0].directionCounts).toEqual({ up: 1, unknown: 1 })
  expect(overview.movementSeasons[0].movements).toEqual(expect.arrayContaining([
    expect.objectContaining({ movementId: 'up-to-second', direction: 'up', levelChange: 2 }),
    expect.objectContaining({ movementId: 'same-level-to-second', direction: 'unknown', levelChange: null }),
  ]))
})
