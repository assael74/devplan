// src/features/playersDatabase/domain/leagueV2/clear/clearLeagueTeamsPlan.builder.test.js

import { buildClearLeagueTeamsPlan, getClearLeaguePlanState } from './clearLeagueTeamsPlan.builder.js'
import { prepareClearLeagueProposal, buildClearLeagueTeamsApprovedState } from './clearLeagueTeamsApprovedState.builder.js'
import { buildLeagueTeamsClearedState } from './leagueTeamsClearedState.builder.js'
import { buildStatsAbsentTeamSeasonState } from '../../statsV2/statsAbsence.builder.js'
import { buildRosterAbsentState } from '../../rosterV2/clear/rosterAbsent.builder.js'
import { buildClearedClubArrays } from './clearLeagueTeamsProjections.builder.js'

const target = { leagueId: 'league-1', seasonKey: '26/27' }
const now = '2026-09-28T12:00:00.000Z'
const sources = () => ({
  leagues: [{ docId: 'league-1', data: {
    id: 'league-1', ageGroupId: 'u15', leagueName: 'ליגה',
    current: { seasonKey: '26_27', seasonId: '28', birthYear: 2012, competitionRules: { configured: true }, tableRank: [{ teamId: 'team-1' }] },
    history: [{ seasonKey: '25/26', seasonId: '27', tableRank: [] }],
  } }],
  teamSeasons: [{ docId: 'team-1__26_27', data: buildStatsAbsentTeamSeasonState(buildRosterAbsentState({ birthTeamDocumentId: 'team-1', leagueId: 'league-1', seasonKey: '26/27' })) }],
  roots: [{ docId: 'team-1', data: { birthYear: 2012, displayName: 'קבוצה', seasons: [
    { seasonKey: '26/27', seasonDocumentId: 'team-1__26_27' },
    { seasonKey: '25/26', seasonDocumentId: 'old' },
  ] } }],
  indexes: [{ docId: 'index-1', data: { entityType: 'birthTeamSeason', leagueId: 'league-1', seasonKey: '2026_2027', teamId: 'team-1' } }],
  identities: [{ docId: 'identity-1', data: { seasonKey: '26/27', birthYear: 2012, entries: [{ leagueId: 'league-1' }, { leagueId: 'other' }] } }],
  clubs: [], clubsMaster: { clubs: [] },
  leaguesMaster: { leagues: [{ leagueId: 'league-1', seasons: [{ seasonKey: '26/27' }, { seasonKey: '25/26', preserved: true }] }] },
})

test('builds the same absent table state as season creation and preserves other seasons', () => {
  const source = sources()
  const plan = buildClearLeagueTeamsPlan(source, target, now)
  expect(plan.operations[0].patch.current.tableRank).toBeNull()
  expect(plan.operations[0].patch.current).not.toHaveProperty('teamPerformanceContext')
  expect(plan.operations[0].patch).not.toHaveProperty('history')
  expect(plan.operations.find(row => row.kind === 'team').rootPatch.seasons).toEqual([source.roots[0].data.seasons[1]])
  expect(plan.operations.find(row => row.kind === 'identity').patch.entries).toEqual([{ leagueId: 'other' }])
  expect(source.leagues[0].data.current.tableRank).toHaveLength(1)
})

test('marks only material cleanup operations as present', () => {
  expect(getClearLeaguePlanState([])).toBe('absent')
  expect(getClearLeaguePlanState([{
    kind: 'league',
    before: { current: { tableRank: null } },
    patch: { current: { tableRank: null } },
  }])).toBe('absent')
  expect(getClearLeaguePlanState([{
    kind: 'team',
    before: {},
    patch: null,
  }])).toBe('present')
})

test('every Player SearchIndex blocks; the plan never owns its deletion', () => {
  const source = sources()
  source.indexes.push({ docId: 'player', data: { entityType: 'playerSeason', leagueId: 'league-1', seasonKey: '26_27' } })
  expect(() => buildClearLeagueTeamsPlan(source, target, now)).toThrow('Player SearchIndexes')
})

test('roster and Stats residues block even when playersCount is zero', () => {
  const source = sources()
  source.teamSeasons[0].data.transfersIn = [{ playerId: 'x' }]
  expect(() => buildClearLeagueTeamsPlan(source, target, now)).toThrow('not absent')
})

test('approval deep clones and freezes the registered plan; arbitrary payloads are rejected', () => {
  const source = sources()
  const proposal = prepareClearLeagueProposal(source, target, now)
  source.roots[0].data.displayName = 'changed'
  const state = buildClearLeagueTeamsApprovedState(proposal)
  expect(state.sources.roots[0].data.displayName).toBe('קבוצה')
  expect(state.sources).not.toBe(proposal.sources)
  expect(Object.isFrozen(state.operations[0].patch.current)).toBe(true)
  expect(() => buildClearLeagueTeamsApprovedState({ ...proposal })).toThrow('Fresh')
})

test('an already cleared League still produces leftover deletion operations', () => {
  const source = sources()
  source.leagues[0].data.current.tableRank = null
  source.leagues[0].data.current.teamPerformanceContext = { appliedFactor: 1, calculatedAt: now }
  const plan = buildClearLeagueTeamsPlan(source, target, '2026-09-29T00:00:00Z')
  expect(plan.operations[0].patch.current).not.toHaveProperty('teamPerformanceContext')
  expect(plan.operations.some(row => row.kind === 'team')).toBe(true)
  expect(plan.operations.some(row => row.kind === 'teamIndex')).toBe(true)
})

test('history scope preserves current and other history rows', () => {
  const source = sources()
  source.leagues[0].data.history = [source.leagues[0].data.current]
  source.leagues[0].data.current = { seasonKey: '27/28', tableRank: [] }
  const plan = buildClearLeagueTeamsPlan(source, target, now)
  expect(plan.operations[0].patch).not.toHaveProperty('current')
  expect(plan.operations[0].patch.history[0].tableRank).toBeNull()
})

test('removes only target forecasts, including manual decisions, and keeps other teams', () => {
  const removed = { teamId: 'team-1', leagueId: 'league-1', seasonKey: '26/27', competitionProjection: { manual: { status: 'PROMOTED' } } }
  const retained = { teamId: 'team-2', leagueId: 'other', seasonKey: '26/27', competitionProjection: { manual: { status: 'KEEP' } } }
  const club = {
    ageGroups: [],
    competitionPaths: [{ birthYear: 2012, seasons: [removed, retained], nextCompetitionPath: { sourceTeamId: 'team-1', projectedNextLeagueLevel: 2 } }],
  }
  const next = buildClearedClubArrays(club, target)
  expect(next.competitionPaths[0].seasons).toEqual([retained])
  expect(next.competitionPaths[0].nextCompetitionPath.projectedNextLeagueLevel).toBeNull()
  expect(club.competitionPaths[0].seasons).toHaveLength(2)
})

test('ambiguous forecast source across seasons blocks instead of erasing another season', () => {
  const club = { competitionPaths: [{
    seasons: [
      { teamId: 'team-1', leagueId: 'league-1', seasonKey: '26/27' },
      { teamId: 'team-1', leagueId: 'league-1', seasonKey: '25/26' },
    ],
    nextCompetitionPath: { sourceTeamId: 'team-1', projectedNextLeagueLevel: 2 },
  }] }
  expect(() => buildClearedClubArrays(club, target)).toThrow('ambiguous')
})

 test('a fresh season needs no canonical business mutation', () => {
  const season = { seasonId: '28', seasonKey: '26/27', birthYear: 2012, tableRank: null, updatedAt: now }
  expect(buildLeagueTeamsClearedState(season)).toEqual(season)
  const source = sources()
  source.leagues[0].data.current = season
  source.teamSeasons = []
  source.roots = []
  source.indexes = []
  source.identities = []
  const plan = buildClearLeagueTeamsPlan(source, target, now)
  expect(plan.operations[0].patch.current).toEqual(season)
})

test('Retry blocks an orphan Root before opening another write session', () => {
  const source = sources()
  source.leagues[0].data.current.tableRank = null
  source.teamSeasons = []
  source.indexes = []
  expect(() => prepareClearLeagueProposal(source, target, now)).toThrow('no provable Team Season')
})

test('an unrelated valid Root is retained and not added to deletion operations', () => {
  const source = sources()
  source.roots.push({ docId: 'other-team', data: { birthYear: 2012, seasons: [{ seasonKey: '26/27', seasonDocumentId: 'other-season' }] } })
  source.teamSeasons.push({ docId: 'other-season', data: { birthTeamDocumentId: 'other-team', seasonKey: '26/27', leagueId: 'other-league' } })
  const plan = buildClearLeagueTeamsPlan(source, target, now)
  expect(plan.operations.filter(row => row.kind === 'team').map(row => row.rootId)).toEqual(['team-1'])
})
