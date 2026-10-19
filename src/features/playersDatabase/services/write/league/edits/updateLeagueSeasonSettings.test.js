// src/features/playersDatabase/services/write/league/edits/updateLeagueSeasonSettings.test.js

import { updateLeagueSeasonSettings } from './updateLeagueSeasonSettings.js'
import { executeManualEdit, readManualEditRefs } from '../../shared/manualEdit.write.js'

const mockDocuments = {}

jest.mock('../../shared/manualEdit.write.js', () => ({
  executeManualEdit: jest.fn(),
  manualEditRef: (collectionKey, id) => ({ path: `${collectionKey}/${id}` }),
  readManualEditRefs: jest.fn(),
  requireManualEditDocument: snapshot => {
    if (!snapshot) throw new Error('missing document')
    return snapshot
  },
}))

const rules = {
  configured: true,
  promotion: { enabled: true, directPlaces: [1], playoffPlaces: [] },
  relegation: { enabled: false, directPlaces: [], playoffPlaces: [] },
}
const identity = { leagueId: 'league-a', seasonId: '2026_2027' }
const leaguePath = 'seasonsById.2026_2027'

beforeEach(() => {
  jest.clearAllMocks()
  Object.keys(mockDocuments).forEach(key => delete mockDocuments[key])
  mockDocuments['leagues/league-a'] = {
    leagueId: 'league-a',
    seasonsById: { '2026_2027': {
      seasonUrl: 'https://old.test',
      birthYear: 2011,
      competitionRules: rules,
      table: { teamsById: {} },
    } },
  }
  mockDocuments['leaguesCenter/all'] = {
    leaguesById: { 'league-a': { seasonsById: { '2026_2027': {
      seasonUrl: 'https://old.test', hasCompetitionRules: true,
    } } } },
  }
  mockDocuments['clubsCenter/2026_2027'] = { clubsById: {} }
  mockDocuments['playerSearchIndexes/player-a'] = {
    leagueId: 'league-a', seasonId: '2026_2027', team: { seasonUrl: 'https://old.test' },
  }
  readManualEditRefs.mockResolvedValue([{ path: 'playerSearchIndexes/player-a' }])
  executeManualEdit.mockImplementation(async ({ refs, build, getSignalRefresh }) => {
    const context = { get: ref => mockDocuments[ref.path], updatedAt: 'now' }
    const changes = build(context)
    return { refs, changes, signalRefresh: getSignalRefresh ? getSignalRefresh(context) : null }
  })
})

test('URL-only save reads and patches only League and LeaguesCenter without refreshing signals', async () => {
  delete mockDocuments['clubsCenter/2026_2027']
  const result = await updateLeagueSeasonSettings({ ...identity, seasonUrl: '' })
  expect(readManualEditRefs).not.toHaveBeenCalled()
  expect(result.refs.map(ref => ref.path)).toEqual(['leagues/league-a', 'leaguesCenter/all'])
  expect(result.changes.find(change => change.ref.path === 'leagues/league-a').patch).toEqual({
    [`${leaguePath}.seasonUrl`]: '',
    [`${leaguePath}.updatedAt`]: 'now',
  })
  expect(result.changes.map(change => change.ref.path)).toEqual(['leagues/league-a', 'leaguesCenter/all'])
  expect(result.changes.find(change => change.ref.path === 'leaguesCenter/all').patch).toEqual({
    'leaguesById.league-a.seasonsById.2026_2027.seasonUrl': '',
    'leaguesById.league-a.seasonsById.2026_2027.updatedAt': 'now',
  })
  expect(mockDocuments['playerSearchIndexes/player-a'].team.seasonUrl).toBe('https://old.test')
  expect(executeManualEdit.mock.calls[0][0].refreshSignals).toBe(false)
  expect(result.signalRefresh).toBeNull()
})

test('Rules-only save patches only changed rule values without querying URL indexes', async () => {
  const result = await updateLeagueSeasonSettings({
    ...identity,
    competitionRules: { ...rules, promotion: { ...rules.promotion, directPlaces: [1, 2] } },
  })
  expect(readManualEditRefs).not.toHaveBeenCalled()
  expect(result.changes).toEqual([{
    ref: { path: 'leagues/league-a' },
    patch: {
      [`${leaguePath}.competitionRules.promotion.directPlaces`]: [1, 2],
      [`${leaguePath}.updatedAt`]: 'now',
    },
  }])
})

test('Combined save builds both field changes in one transaction without replacing the season', async () => {
  const result = await updateLeagueSeasonSettings({
    ...identity,
    seasonUrl: 'https://new.test',
    competitionRules: { ...rules, promotion: { ...rules.promotion, playoffPlaces: [2] } },
  })
  expect(executeManualEdit).toHaveBeenCalledTimes(1)
  expect(readManualEditRefs).not.toHaveBeenCalled()
  expect(result.refs.map(ref => ref.path)).toEqual([
    'leagues/league-a', 'leaguesCenter/all', 'clubsCenter/2026_2027',
  ])
  const patch = result.changes.find(change => change.ref.path === 'leagues/league-a').patch
  expect(patch).toEqual({
    [`${leaguePath}.seasonUrl`]: 'https://new.test',
    [`${leaguePath}.competitionRules.promotion.playoffPlaces`]: [2],
    [`${leaguePath}.updatedAt`]: 'now',
  })
})

test('Unchanged settings produce no writes', async () => {
  const result = await updateLeagueSeasonSettings({
    ...identity, seasonUrl: 'https://old.test', competitionRules: rules,
  })
  expect(result.changes).toEqual([])
})

test('URL no-op ignores a stale legacy SearchIndex URL', async () => {
  mockDocuments['playerSearchIndexes/player-a'].team.seasonUrl = 'https://legacy.test'
  const result = await updateLeagueSeasonSettings({ ...identity, seasonUrl: 'https://old.test' })
  expect(readManualEditRefs).not.toHaveBeenCalled()
  expect(result.changes).toEqual([])
  expect(result.signalRefresh).toBeNull()
  expect(mockDocuments['playerSearchIndexes/player-a'].team.seasonUrl).toBe('https://legacy.test')
})

test('rules retry refreshes only the next younger birth year in the edited season and its canonical clubs', async () => {
  const league = mockDocuments['leagues/league-a']
  league.seasonsById['2026_2027'].table.teamsById = {
    teamA: { clubId: 'club-a' }, teamA2: { clubId: 'club-a' }, teamB: { clubId: 'club-b' },
  }
  league.seasonsById['2025_2026'] = {
    birthYear: 2011, table: { teamsById: { old: { clubId: 'other-season' } } },
  }
  mockDocuments['leaguesCenter/all'].leaguesById.other = {
    seasonsById: { '2026_2027': { teamsById: { other: { clubId: 'unrelated-center' } } } },
  }
  mockDocuments['clubsCenter/2026_2027'].clubsById.unrelated = { clubId: 'unrelated-club' }
  const result = await updateLeagueSeasonSettings({ ...identity, competitionRules: rules })
  expect(result.changes).toEqual([])
  expect(result.signalRefresh).toEqual({
    clubIds: ['club-a', 'club-b'], scope: { seasonId: '2026_2027', birthYear: 2012 },
  })
})

test('an empty edited table cannot expand refresh scope to Center entries', async () => {
  const result = await updateLeagueSeasonSettings({ ...identity, competitionRules: rules })
  expect(result.signalRefresh).toEqual({ clubIds: [], scope: { seasonId: '2026_2027', birthYear: 2012 } })
})

test('rules without a canonical birth year fail instead of requesting a wide refresh', async () => {
  delete mockDocuments['leagues/league-a'].seasonsById['2026_2027'].birthYear
  await expect(updateLeagueSeasonSettings({ ...identity, competitionRules: rules })).rejects.toThrow('שנתון עונת הליגה חסר')
})

test('Missing required competition data rejects the combined operation before patches are returned', async () => {
  delete mockDocuments['clubsCenter/2026_2027']
  await expect(updateLeagueSeasonSettings({
    ...identity,
    seasonUrl: 'https://new.test',
    competitionRules: { ...rules, promotion: { ...rules.promotion, directPlaces: [1, 2] } },
  })).rejects.toThrow('missing document')
})
