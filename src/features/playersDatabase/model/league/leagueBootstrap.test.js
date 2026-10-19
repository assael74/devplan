// src/features/playersDatabase/model/league/leagueBootstrap.test.js

import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../catalog/leagues.catalog.js'
import { buildTeamSignalSummary } from '../../domain/signals/teamSignalSummary.js'
import { PLAYERS_DATABASE_AGE_GROUPS_CATALOG } from '../../catalog/ageGroups.catalog.js'
import { PLAYERS_DATABASE_CURRENT_SEASON_KEY } from '../../catalog/seasons.catalog.js'
import {
  buildLeagueCenterLeagueDocuments,
  buildLeagueCenterRows,
} from './center/leagueCenterRows.model.js'
import {
  buildLeagueCenterOpenOptions,
  hasLeagueCenterSeason,
} from './center/leagueCenterOptions.model.js'
import {
  buildLeaguePageBootstrapLeague,
  buildLeaguePageSeasonOptions,
} from './page/leaguePage.model.js'

test('does not seed League Center rows from the catalog when LeaguesCenter is missing', () => {
  const documents = buildLeagueCenterLeagueDocuments({ leaguesCenterDoc: null })
  const rows = buildLeagueCenterRows({ leagueDocs: documents })

  expect(documents).toEqual([])
  expect(rows).toEqual([])
})

test('builds League Center rows only for created league projections', () => {
  const catalogLeague = PLAYERS_DATABASE_LEAGUES_CATALOG[0]
  const documents = buildLeagueCenterLeagueDocuments({
    leaguesCenterDoc: {
      leaguesById: {
        [catalogLeague.id]: {
          identity: {
            leagueName: catalogLeague.name,
            ageGroupId: catalogLeague.ageGroupId,
            ageGroupLabel: catalogLeague.ageGroupLabel,
            level: catalogLeague.level,
          },
          seasonsById: {},
        },
      },
    },
  })
  const rows = buildLeagueCenterRows({ leagueDocs: documents })

  expect(documents).toHaveLength(1)
  expect(rows).toHaveLength(1)
  expect(rows[0]).toEqual(expect.objectContaining({
    leagueId: catalogLeague.id,
    hasLeagueDoc: true,
  }))
})

test('derives operational League Center facts from the season projection', () => {
  const catalogLeague = PLAYERS_DATABASE_LEAGUES_CATALOG[0]
  const rows = buildLeagueCenterRows({
    leagueDocs: [{
      leagueId: catalogLeague.id,
      catalog: catalogLeague,
      projection: {
        identity: {
          leagueName: catalogLeague.name,
          ageGroupId: catalogLeague.ageGroupId,
          ageGroupLabel: catalogLeague.ageGroupLabel,
          level: catalogLeague.level,
        },
        seasonsById: {
          '2026_2027': {
            seasonKey: '26/27',
            seasonStatus: 'active',
            birthYear: 2008,
            seasonUrl: 'https://example.com/league',
            tableState: 'LOADED',
            tableImportedAt: '2026-10-05T00:00:00.000Z',
            teamsById: {
              teamOne: {
                documentationState: 'NO_ROSTER',
                documentationStateUpdatedAt: '2026-10-03T00:00:00.000Z',
                teamSignalSummary: buildTeamSignalSummary({ familiesById: {
                  'roster-balance': { level: 1, availability: 'available' },
                } }),
              },
              teamTwo: {
                documentationState: 'STATS_FINAL',
                documentationStateUpdatedAt: '2026-10-04T00:00:00.000Z',
                teamSignalSummary: buildTeamSignalSummary({ familiesById: {
                  'roster-balance': { level: 2, availability: 'available' },
                } }),
              },
            },
          },
        },
      },
    }],
  })

  expect(rows[0]).toEqual(expect.objectContaining({
    seasonWorkStatus: 'active',
    seasonUrl: 'https://example.com/league',
    tableState: 'LOADED',
    teamsCount: 2,
    requiresReview: true,
    hasTeamSignals: true,
    signalStrengthCounts: { strong: 1, watch: 1, none: 0, uncovered: 0 },
    strongSignalWorkCounts: {
      strongMin1: 1, strongMin2: 0, strongMin3: 0,
      strongMin1Pending: 1, strongMin2Pending: 0, strongMin3Pending: 0,
    },
    researchWorkCounts: { pendingStrong: 1, pendingWatch: 1, markedInvestigation: 0, missingSignalInformation: 0 },
    signalFamiliesById: expect.objectContaining({
      'roster-balance': expect.objectContaining({ activeTeamCount: 2, maxLevel: 2 }),
    }),
    latestDocumentationUpdatedAt: '2026-10-04T00:00:00.000Z',
  }))
})

test('offers every catalog league and marks its existing seasons', () => {
  const existingLeague = PLAYERS_DATABASE_LEAGUES_CATALOG[0]
  const options = buildLeagueCenterOpenOptions([{
    leagueId: existingLeague.id,
    projection: {
      seasonsById: {
        '2025_2026': {},
      },
    },
  }])
  const existingOption = options.find(option => option.value === existingLeague.id)

  expect(options).toHaveLength(PLAYERS_DATABASE_LEAGUES_CATALOG.length)
  expect(existingOption.existingSeasonIds).toEqual(['2025_2026'])
  expect(options[0]).toEqual(expect.objectContaining({
    value: expect.any(String),
    ageGroupId: expect.any(String),
    ageGroupLabel: expect.any(String),
    name: expect.any(String),
    label: expect.any(String),
  }))
})

test('detects the opened season only after it appears in LeaguesCenter', () => {
  const leagueId = 'league-1'
  const seasonId = '2026_2027'

  expect(hasLeagueCenterSeason({
    leaguesCenterDoc: { leaguesById: { [leagueId]: { seasonsById: {} } } },
    leagueId,
    seasonId,
  })).toBe(false)
  expect(hasLeagueCenterSeason({
    leaguesCenterDoc: {
      leaguesById: {
        [leagueId]: {
          seasonsById: { [seasonId]: { tableState: 'NOT_LOADED' } },
        },
      },
    },
    leagueId,
    seasonId,
  })).toBe(true)
})

test('builds direct League Page bootstrap with the technical catalog season id', () => {
  const catalogLeague = PLAYERS_DATABASE_LEAGUES_CATALOG[0]
  const league = buildLeaguePageBootstrapLeague(catalogLeague.id)
  const options = buildLeaguePageSeasonOptions(league)

  expect(options).toHaveLength(1)
  expect(options[0]).toEqual(expect.objectContaining({
    target: 'bootstrap',
    seasonId: '2026_2027',
    seasonKey: PLAYERS_DATABASE_CURRENT_SEASON_KEY,
    birthYear: 2008,
  }))
  expect(options[0].season.seasonId).toBe('2026_2027')
  expect(options[0].season.bootstrap).toBe(true)
})

test('every catalog league resolves its age group label from the canonical catalog', () => {
  const ageGroupsById = new Map(PLAYERS_DATABASE_AGE_GROUPS_CATALOG.map(ageGroup => [
    ageGroup.id,
    ageGroup,
  ]))

  PLAYERS_DATABASE_LEAGUES_CATALOG.forEach(league => {
    const ageGroup = ageGroupsById.get(league.ageGroupId)

    expect(ageGroup).toBeDefined()
    expect(league.ageGroupLabel).toBe(ageGroup.label)
  })
})
