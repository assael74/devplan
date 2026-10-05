// src/features/playersDatabase/model/team/page/teamPageSeason.model.test.js

import {
  buildTeamPageSeasonOptions,
  findTeamPageLeagueSeasonDoc,
  findTeamPageSeasonDoc,
} from './teamPageSeason.model.js'

const teamId = 'club-a_2012_1'

const buildLeague = ({
  leagueId = 'u14-center',
  seasonId = '2026_2027',
  seasonKey = '26/27',
  teamsById = {},
} = {}) => ({
  leagueId,
  names: { display: 'נערים ג מרכז' },
  ageGroupId: 'u14',
  ageGroupLabel: 'נערים ג',
  seasonsById: {
    [seasonId]: {
      seasonId,
      seasonKey,
      birthYear: 2012,
      seasonStatus: 'active',
      table: { teamsById },
    },
  },
})

const buildTeamSeason = ({
  leagueId = 'u13-center',
  seasonId = '2025_2026',
  seasonKey = '25/26',
} = {}) => ({
  id: `${teamId}__${seasonId}`,
  identity: {
    teamId,
    seasonId,
    seasonKey,
    seasonStatus: 'completed',
    leagueId,
    ageGroupId: 'u13',
    birthYear: 2012,
  },
})

test('does not invent the route league season when the team is absent from its table', () => {
  const teamSeason = buildTeamSeason()
  const options = buildTeamPageSeasonOptions(
    [buildLeague()],
    { identity: { teamId, birthYear: 2012 } },
    [teamSeason],
    teamId
  )

  expect(options).toHaveLength(1)
  expect(options[0]).toMatchObject({
    seasonId: '2025_2026',
    seasonKey: '25/26',
    leagueId: 'u13-center',
    ageGroupId: 'u13',
  })
  expect(findTeamPageSeasonDoc({
    teamSeasons: [teamSeason],
    selectedSeasonOption: options[0],
  })).toBe(teamSeason)
})

test('offers a canonical league season when the team exists in teamsById', () => {
  const league = buildLeague({
    teamsById: {
      [teamId]: {
        clubId: 'club-a',
        teamSlot: 1,
        officialTable: { rank: 4 },
      },
    },
  })
  const options = buildTeamPageSeasonOptions(
    [league],
    { identity: { teamId, birthYear: 2012 } },
    [],
    teamId
  )

  expect(options).toHaveLength(1)
  expect(options[0]).toMatchObject({
    seasonId: '2026_2027',
    seasonKey: '26/27',
    leagueId: 'u14-center',
    ageGroupId: 'u14',
  })
  expect(findTeamPageLeagueSeasonDoc({
    leagueDoc: league,
    leagueDocuments: [league],
    selectedSeasonOption: options[0],
  })).toMatchObject({
    leagueDoc: league,
    season: { seasonId: '2026_2027' },
    target: 'current',
  })
})

test('selects the Team Season that matches the clicked option', () => {
  const currentSeason = buildTeamSeason()
  const previousSeason = buildTeamSeason({
    leagueId: 'u12-center',
    seasonId: '2024_2025',
    seasonKey: '24/25',
  })
  const teamSeasons = [currentSeason, previousSeason]
  const options = buildTeamPageSeasonOptions(
    [],
    { identity: { teamId, birthYear: 2012 } },
    teamSeasons,
    teamId
  )
  const clickedOption = options.find(option => option.seasonKey === '24/25')

  expect(clickedOption?.optionKey).toContain('24/25')
  expect(findTeamPageSeasonDoc({
    teamSeasons,
    selectedSeasonOption: clickedOption,
  })).toBe(previousSeason)
})
