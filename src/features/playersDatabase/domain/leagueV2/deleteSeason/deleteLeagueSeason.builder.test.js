// src/features/playersDatabase/domain/leagueV2/deleteSeason/deleteLeagueSeason.builder.test.js

import { buildDeleteLeagueSeasonPlan, buildCanonicalLeaguesMasterPatch } from './deleteLeagueSeason.builder.js'
import { prepareDeleteSeasonProposal, approveDeleteSeason } from './deleteLeagueSeasonApprovedState.builder.js'

const target = { leagueId: 'league', seasonKey: '26/27' }
const time = '2026-09-28T12:00:00.000Z'
const sources = () => {
  const leagues = [{ docId: 'league', data: {
    id: 'league', leagueId: 'league', leagueName: 'ליגה', ageGroupId: 'u15', settings: { keep: true },
    current: { seasonKey: '26/27', seasonId: '28', birthYear: 2012, tableRank: null, updatedAt: 'unchanged' },
    history: [{ seasonKey: '25/26', tableRank: [], updatedAt: 'preserved' }],
  } }]
  return { leagues, teamSeasons: [], roots: [], indexes: [], identities: [], clubs: [], clubsMaster: null,
    leaguesMaster: { id: 'all', ...buildCanonicalLeaguesMasterPatch(leagues) } }
}

test('null permits deletion while a loaded empty table blocks', () => {
  const input = sources()
  expect(buildDeleteLeagueSeasonPlan(input, target, time).retryState).toBe('season_present')
  input.leagues[0].data.current.tableRank = []
  expect(() => buildDeleteLeagueSeasonPlan(input, target, time)).toThrow('Clear League Teams first')
})

test('temporarily permits only an empty legacy 24/25 table after dependency validation', () => {
  const input = sources()
  input.leagues[0].data.history.push({ seasonKey: '24/25', tableRank: [] })
  const legacyTarget = { leagueId: 'league', seasonKey: '24/25' }
  expect(buildDeleteLeagueSeasonPlan(input, legacyTarget, time).retryState).toBe('season_present')

  input.indexes.push({ docId: 'legacy-index', data: { leagueId: 'league', seasonKey: '24/25' } })
  expect(() => buildDeleteLeagueSeasonPlan(input, legacyTarget, time)).toThrow('SearchIndexes')
})

test('the last season is removed but both League identities remain', () => {
  const input = sources()
  input.leagues[0].data.history = []
  const plan = buildDeleteLeagueSeasonPlan(input, target, time)
  expect(plan.operations[0].patch).toEqual({ current: null, updatedAt: time })
  expect(plan.operations[1].patch.leagues[0]).toMatchObject({ leagueId: 'league', seasons: [] })
  expect(plan.operations[1].patch.summary.leaguesCount).toBe(1)
})

test('history deletion preserves current, other seasons, settings and their timestamps', () => {
  const input = sources()
  input.leagues[0].data.history.push({ seasonKey: '24/25', tableRank: null, updatedAt: 'keep' })
  input.leagues[0].data.history[0].tableRank = null
  const before = JSON.parse(JSON.stringify(input))
  const plan = buildDeleteLeagueSeasonPlan(input, { ...target, seasonKey: '25/26' }, time)
  expect(plan.operations[0].patch).toEqual({ history: [before.leagues[0].data.history[1]], updatedAt: time })
  expect(plan.operations[0].patch).not.toHaveProperty('current')
  expect(plan.operations[0].patch).not.toHaveProperty('settings')
  expect(input).toEqual(before)
})

test('Retry after canonical success repairs Master then reaches clean absence', () => {
  const input = sources()
  const first = buildDeleteLeagueSeasonPlan(input, target, time)
  input.leagues[0].data = { ...input.leagues[0].data, ...first.operations[0].patch }
  const retry = buildDeleteLeagueSeasonPlan(input, target, time)
  expect(retry.retryState).toBe('season_absent_master_stale')
  expect(retry.operations.map(row => row.kind)).toEqual(['leaguesMaster'])
  input.leaguesMaster = { ...input.leaguesMaster, ...retry.operations[0].patch }
  expect(buildDeleteLeagueSeasonPlan(input, target, time).retryState).toBe('season_absent_clean')
})

test('Master entries and summary derive from all canonical Leagues, never stale Master totals', () => {
  const input = sources()
  input.leagues.push({ docId: 'other', data: { id: 'other', current: { seasonKey: '26/27', tableRank: [{ playersCount: 7 }] }, history: [] } })
  input.leaguesMaster.summary.playersCount = 999
  const master = buildDeleteLeagueSeasonPlan(input, target, time).operations[1].patch
  expect(master.leagues).toHaveLength(2)
  expect(master.summary.playersCount).toBe(7)
})

test('equivalent keys resolve one season and duplicate variants block', () => {
  const input = sources()
  input.leagues[0].data.current.seasonKey = '2026_2027'
  expect(buildDeleteLeagueSeasonPlan(input, target, time).operations[0].patch.current).toBeNull()
  input.leagues[0].data.history.push({ seasonKey: '26_27', tableRank: null })
  expect(() => buildDeleteLeagueSeasonPlan(input, target, time)).toThrow('multiple seasons')
})

test.each(['indexes', 'teamSeasons'])('equivalent season residue in %s blocks without cascade', kind => {
  const input = sources()
  input[kind].push({ docId: 'residue', data: { leagueId: 'league', seasonKey: '2026_2027' } })
  expect(() => buildDeleteLeagueSeasonPlan(input, target, time)).toThrow()
  expect(input[kind]).toHaveLength(1)
})

test('Identity and Club rows block deletion and remain untouched', () => {
  const input = sources()
  input.identities = [{ docId: 'identity', data: { seasonKey: '26_27', entries: [{ leagueId: 'league' }] } }]
  expect(() => buildDeleteLeagueSeasonPlan(input, target, time)).toThrow('Identity')
  input.identities = []
  input.clubs = [{ docId: 'club', data: { ageGroups: [{ seasons: [{ leagueId: 'league', seasonKey: '26/27' }] }] } }]
  expect(() => buildDeleteLeagueSeasonPlan(input, target, time)).toThrow('Club')
})

test('missing League identity blocks even when the season is absent', () => {
  const input = sources()
  input.leagues = []
  expect(() => buildDeleteLeagueSeasonPlan(input, target, time)).toThrow('identity must remain')
})

test('Approved State is isolated and deeply frozen; a submitted clone is rejected', () => {
  const input = sources()
  const proposal = prepareDeleteSeasonProposal(input, target, time)
  input.leagues[0].data.settings.keep = false
  const state = approveDeleteSeason(proposal)
  expect(state.sources.leagues[0].data.settings.keep).toBe(true)
  expect(Object.isFrozen(state.operations[0].patch)).toBe(true)
  expect(() => approveDeleteSeason({ ...proposal })).toThrow('registered')
})

test('an unrelated ClubsMaster competition-path mismatch does not block season deletion', () => {
  const input = sources()
  input.clubs = [{ docId: 'club', data: { clubId: 'club', ageGroups: [], competitionPaths: [] } }]
  input.clubsMaster = { clubs: [{ clubId: 'club', ageGroups: [], competitionPaths: [{ birthYear: 2012, projectedNextLeagueLevel: 2 }] }] }
  expect(buildDeleteLeagueSeasonPlan(input, target, time).retryState).toBe('season_present')
})
