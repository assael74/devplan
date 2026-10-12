// src/features/playersDatabase/services/audit/system/repair/sourceRepairPlan.test.js

import { buildSourceRepairPlan } from './sourceRepairPlan.js'

const teamId = 'club-a_2011_1'
const seasonId = '2025_2026'
const teamSeasonId = `${teamId}__${seasonId}`
const playerId = 'player__2011__12345'
const teamSeason = () => ({
  id: teamSeasonId,
  data: {
    identity: {
      teamSeasonDocumentId: teamSeasonId,
      teamId,
      clubId: 'club-a',
      birthYear: 2011,
      teamSlot: 1,
      seasonId,
      seasonKey: '25/26',
      seasonStatus: 'active',
      leagueId: 'league-a',
      ageGroupId: 'u15',
    },
    roster: {
      playersById: {
        [playerId]: { externalPlayerId: '12345', fullName: 'שחקן א', normalizedName: 'שחקן א' },
      },
    },
    stats: { playersById: { [playerId]: { statsStatus: 'loaded' } } },
  },
})
const actualState = () => ({
  teamRoots: [],
  teamSeasons: [teamSeason()],
  playerRoots: [],
  clubProfiles: [],
  leagues: [{
    id: 'league-a',
    data: { leagueId: 'league-a', seasonsById: { [seasonId]: { seasonKey: '25/26', table: { teamsById: { [teamId]: { clubId: 'club-a' } } } } } },
  }],
})
const teamRootFinding = { target: 'teamSeasons', type: 'broken_relation', documentId: teamSeasonId, relatedDocumentId: teamId, owner: 'roster', teamId, seasonId }
const playerRootFinding = { target: 'playerRoots', type: 'missing_canonical', documentId: playerId, relatedDocumentId: teamSeasonId, owner: 'stats', playerId, teamId, seasonId }

describe('source repair planning', () => {
  test('restores team identity from canonical seasons and guards its source', () => {
    const actual = actualState()
    const result = buildSourceRepairPlan({ actual, finding: teamRootFinding })
    expect(result.allowed).toBe(true)
    expect(result.changes).toHaveLength(1)
    expect(result.changes[0]).toMatchObject({
      target: 'teamRoots', documentId: teamId, before: null,
      after: { identity: { teamId, teamSlot: 1 }, seasonRefsById: { [seasonId]: { teamSeasonDocumentId: teamSeasonId } } },
    })
    expect(result.guards).toEqual([{ target: 'teamSeasons', documentId: teamSeasonId, before: actual.teamSeasons[0].data }])
  })

  test('does not create a root from conflicting canonical identity or overwrite a root', () => {
    const actual = actualState()
    actual.teamSeasons[0].data.identity.teamSlot = 2
    expect(buildSourceRepairPlan({ actual, finding: teamRootFinding }).allowed).toBe(false)
    actual.teamRoots.push({ id: teamId, data: { notes: 'keep' } })
    expect(buildSourceRepairPlan({ actual, finding: teamRootFinding }).supported).toBe(false)
  })

  test('creates a player root from canonical roster identity with stats lifecycle', () => {
    const actual = actualState()
    const result = buildSourceRepairPlan({ actual, finding: playerRootFinding })
    expect(result.allowed).toBe(true)
    expect(result.changes[0].after).toMatchObject({
      identity: { playerId, externalPlayerId: '12345', birthYear: 2011, fullName: 'שחקן א' },
      notes: '',
      timestamps: { createdAt: null, updatedAt: null },
    })
    expect(result.guards).toHaveLength(1)
  })

  test('roster appearance alone does not create a player root', () => {
    const actual = actualState()
    actual.teamSeasons[0].data.stats.playersById = {}
    expect(buildSourceRepairPlan({ actual, finding: playerRootFinding }).allowed).toBe(false)
  })

  test('incomplete player source opens roster reload without reading a search projection', () => {
    const actual = actualState()
    actual.teamSeasons[0].data.roster.playersById[playerId].fullName = ''
    actual.playerSearchIndexes = [{ id: 'unused', data: { playerId, fullName: 'do not restore' } }]
    const result = buildSourceRepairPlan({ actual, finding: playerRootFinding })
    expect(result.changes).toEqual([])
    expect(result.reload).toMatchObject({ kind: 'roster', context: { teamId, seasonId } })
  })

  test('missing team season opens canonical roster input, not empty document creation', () => {
    const actual = actualState()
    actual.teamSeasons = []
    const result = buildSourceRepairPlan({
      actual,
      finding: { type: 'broken_relation', target: 'teamRoots', documentId: teamId, owner: 'roster', teamId, seasonId },
    })
    expect(result.reload.route).toContain('openRosterImport=1')
    expect(result.changes).toEqual([])
  })

  test('missing league season opens league source entry', () => {
    const actual = actualState()
    actual.leagues = []
    const result = buildSourceRepairPlan({
      actual,
      finding: { ...teamRootFinding, owner: 'league', leagueId: 'league-a' },
    })
    expect(result.reload).toMatchObject({ kind: 'league', context: { leagueId: 'league-a', seasonId } })
    expect(result.changes).toEqual([])
  })

  test('missing club requires explicit canonical names and validates user input', () => {
    const actual = actualState()
    actual.clubsDirectory = [{ id: 'all', data: { clubsById: { 'club-a': { names: { official: 'not a source', display: 'not a source' } } } } }]
    const finding = { target: 'clubProfiles', documentId: 'club-a', clubId: 'club-a', type: 'missing_canonical', owner: 'clubProfiles' }
    const empty = buildSourceRepairPlan({ actual, finding })
    expect(empty.allowed).toBe(false)
    expect(empty.fields.filter(field => field.required).map(field => field.name)).toEqual(['officialName', 'displayName'])
    expect(empty.changes).toEqual([])
    const input = { officialName: 'מועדון א', displayName: 'מועדון א', aliases: 'א, ב, א', clubLevel: '2', clubUrl: 'https://example.com/club' }
    const result = buildSourceRepairPlan({ actual, finding, input })
    expect(result.allowed).toBe(true)
    expect(result.changes[0].after).toMatchObject({ clubId: 'club-a', clubLevel: 2, clubStrengthLevel: null, aliases: ['א', 'ב'] })
    expect(buildSourceRepairPlan({ actual, finding, input: { ...input, clubUrl: 'data:text/plain,test' } }).allowed).toBe(false)
    expect(buildSourceRepairPlan({ actual, finding, input: { ...input, clubLevel: 'not-number' } }).allowed).toBe(false)
  })
})
