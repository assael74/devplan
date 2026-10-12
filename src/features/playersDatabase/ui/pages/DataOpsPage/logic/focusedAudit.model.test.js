// src/features/playersDatabase/ui/pages/DataOpsPage/logic/focusedAudit.model.test.js

import {
  buildFocusedAuditPlan,
  getFocusedAuditAgeGroupOptions,
  getFocusedAuditBirthYearOptions,
  getFocusedAuditClubOptions,
  getFocusedAuditLeagueOptions,
  getFocusedAuditPlayerOptions,
  getFocusedAuditTeamSlotOptions,
  getFocusedAuditTeamOptions,
} from './focusedAudit.model.js'

const leaguesCenterDoc = {
  leaguesById: {
    'u19-premier': {
      seasonsById: {
        '2026_2027': {
          teamsById: {
            teamA: {
              clubId: 'club-a',
              displayName: 'קבוצה א',
              birthYear: 2008,
              playersCount: 2,
            },
            teamB: { clubId: 'club-b', displayName: 'קבוצה ב', playersCount: 3 },
          },
        },
      },
    },
  },
}

test('builds cascading named options from the leagues center', () => {
  const leagues = getFocusedAuditLeagueOptions({ leaguesCenterDoc, seasonId: '2026_2027' })
  const teams = getFocusedAuditTeamOptions({
    leaguesCenterDoc,
    leagueId: 'u19-premier',
    seasonId: '2026_2027',
  })
  const players = getFocusedAuditPlayerOptions({
    roster: {
      playersById: {
        playerA: { fullName: 'שחקן א' },
      },
    },
  })

  expect(leagues).toHaveLength(1)
  expect(leagues[0].label).toContain('ליגת העל')
  expect(teams.map(option => option.label)).toEqual(['קבוצה א', 'קבוצה ב'])
  expect(teams[0]).toEqual(expect.objectContaining({
    birthYear: 2008,
    teamSlot: 1,
    ageGroupId: 'u19',
    ageGroupLabel: 'נוער',
  }))
  expect(players).toEqual([{ value: 'playerA', label: 'שחקן א' }])
})

test('builds the Team Root selection cascade only from existing teams', () => {
  const teams = getFocusedAuditTeamOptions({
    leaguesCenterDoc,
    seasonId: '2026_2027',
  })
  const clubs = getFocusedAuditClubOptions({
    teamOptions: teams,
    clubsDirectoryDoc: {
      clubsById: {
        'club-a': { names: { short: 'מועדון א' } },
        'club-b': { names: { short: 'מועדון ב' } },
      },
    },
  })
  const birthYears = getFocusedAuditBirthYearOptions({
    teamOptions: teams,
    clubId: 'club-a',
    teamSlot: '1',
    seasonId: '2026_2027',
  })
  const slots = getFocusedAuditTeamSlotOptions({
    teamOptions: teams,
    clubId: 'club-a',
  })
  const ageGroups = getFocusedAuditAgeGroupOptions({
    teamOptions: teams,
    clubId: 'club-a',
    seasonId: '2026_2027',
    birthYear: '2008',
    teamSlot: '1',
  })

  expect(clubs).toEqual(expect.arrayContaining([
    expect.objectContaining({ value: 'club-a', label: 'מועדון א' }),
  ]))
  expect(birthYears).toEqual([{ value: '2008', label: '2008' }])
  expect(slots).toEqual([{ value: '1', label: '1' }])
  expect(ageGroups).toEqual([
    expect.objectContaining({
      teamId: 'teamA',
      leagueId: 'u19-premier',
      ageGroupId: 'u19',
      label: 'נוער · ליגת העל',
    }),
  ])
})

test('counts unique documents for a team audit', () => {
  const plan = buildFocusedAuditPlan({
    type: 'team',
    leaguesCenterDoc,
    leagueId: 'u19-premier',
    seasonId: '2026_2027',
    teamId: 'teamA',
  })

  expect(plan.ready).toBe(true)
  expect(plan.total).toBe(11)
  expect(plan.collections.find(item => item.id === 'playerSeasons').count).toBe(2)
})

test('lists teams across leagues and keeps the league needed for the audit', () => {
  const options = getFocusedAuditTeamOptions({
    leaguesCenterDoc,
    seasonId: '2026_2027',
  })

  expect(options).toHaveLength(2)
  expect(options[0]).toEqual(expect.objectContaining({
    leagueId: 'u19-premier',
  }))
  expect(options[0].label).not.toContain('ליגת העל')
  expect(options[0].label).not.toContain('נוער')
})

test('limits a player audit plan to one player', () => {
  const plan = buildFocusedAuditPlan({
    type: 'player',
    leaguesCenterDoc,
    leagueId: 'u19-premier',
    seasonId: '2026_2027',
    teamId: 'teamA',
    teamSeason: {
      roster: {
        playersById: {
          playerA: {},
          playerB: {},
        },
      },
    },
  })

  expect(plan.total).toBe(8)
  expect(plan.collections.find(item => item.id === 'playerRoots').count).toBe(1)
})
