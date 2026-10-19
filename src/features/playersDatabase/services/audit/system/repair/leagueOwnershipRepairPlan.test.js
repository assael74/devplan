// src/features/playersDatabase/services/audit/system/repair/leagueOwnershipRepairPlan.test.js

import { buildLeagueOwnershipRepairPlan } from './leagueOwnershipRepairPlan.js'
import { evaluateSystemIntegrity } from '../evaluate.js'

const seasonId = '2025_2026'
const teamId = 'club-a_2010_1'
const teamSeasonDocumentId = `${teamId}__${seasonId}`
const playerId = 'player__2010__12345'
const playerSeasonId = `playerSeason__${playerId}__${seasonId}`
const finding = {
  target: 'leagues', type: 'broken_relation', teamId, seasonId, actual: ['league-a', 'league-b'],
}
const league = leagueId => ({
  id: leagueId,
  data: {
    leagueId, names: { display: leagueId }, ageGroupId: 'u16', ageGroupLabel: 'נערים', level: 2,
    seasonsById: {
      [seasonId]: {
        seasonKey: '25/26', seasonStatus: 'active', birthYear: 2010, updatedAt: null,
        table: {
          tableState: 'LOADED',
          teamsById: { [teamId]: { clubId: 'club-a', teamSlot: 1, officialTable: { rank: 1, points: 12, teamGamePlayed: 4 } } },
        },
      },
    },
  },
})
const fixture = () => ({
  leagues: [league('league-a'), league('league-b')],
  clubProfiles: [{ id: 'club-a', data: { clubId: 'club-a', names: { display: 'א', short: 'א' }, clubLevel: 2, clubStrengthLevel: 3 } }],
  teamSeasons: [{
    id: teamSeasonDocumentId,
    data: {
      identity: { teamSeasonDocumentId, teamId, seasonId, clubId: 'club-a', leagueId: 'league-a', birthYear: 2010, teamSlot: 1, seasonKey: '25/26', seasonStatus: 'active' },
      roster: { playersById: { [playerId]: { externalPlayerId: '12345', fullName: 'שחקן' } }, pendingById: {} },
      stats: { playersById: { [playerId]: { statsStatus: 'loaded', playerStats: { goals: 3 } } } },
      movement: { transfersInById: {}, transfersOutById: {} },
    },
  }],
  teamRoots: [{ id: teamId, data: { identity: { teamId }, seasonRefsById: { [seasonId]: { leagueId: 'league-a' } }, notes: 'keep' } }],
  playerSeasons: [{ id: playerSeasonId, data: {
    identity: { playerId, seasonId, playerSeasonDocumentId: playerSeasonId },
    teamsById: { [teamId]: { leagueId: 'league-a', manual: { note: 'keep' } }, other: { leagueId: 'other' } },
  } }],
})

test('requires a deliberate league choice and never defaults to the first owner', () => {
  const plan = buildLeagueOwnershipRepairPlan({ actual: fixture(), finding })
  expect(plan.allowed).toBe(false)
  expect(plan.fields[0].options).toHaveLength(2)
  expect(plan.changes).toEqual([])
})

test('preserves existing signal fields and unrelated projection fields while rebuilding surviving rows', () => {
  const actual = fixture()
  const retained = {
    teamTaskSignals: { offense: true }, teamTaskAvailability: 'partial',
    teamSignalSummary: { computedAt: 'old', familiesById: {} }, custom: 'keep',
  }
  actual.leaguesCenter = [{ id: 'all', data: { leaguesById: { 'league-b': { seasonsById: {
    [seasonId]: { customSeason: 'keep', teamsById: { [teamId]: retained } },
  } } } } }]
  actual.clubsCenter = [{ id: seasonId, data: { clubsById: { 'club-a': { teamsById: {
    [teamId]: { ...retained, leagueId: 'league-a' },
  } } } } }]
  actual.leagues[1].data.seasonsById[seasonId].table.teamsById[teamId].scouting = {
    teamTaskSignals: { defense: true }, customScouting: 'keep',
  }
  const plan = buildLeagueOwnershipRepairPlan({ actual, finding, input: { leagueId: 'league-b' } })
  expect(plan.allowed).toBe(true)
  const leaguesCenter = plan.changes.find(change => change.target === 'leaguesCenter').after
  expect(leaguesCenter.leaguesById['league-b'].seasonsById[seasonId])
    .toMatchObject({ customSeason: 'keep', teamsById: { [teamId]: retained } })
  const clubsCenter = plan.changes.find(change => change.target === 'clubsCenter').after
  expect(clubsCenter.clubsById['club-a'].teamsById[teamId]).toMatchObject(retained)
  const winningLeague = plan.changes.find(change => change.target === 'leagues' && change.documentId === 'league-b').after
  expect(winningLeague.seasonsById[seasonId].table.teamsById[teamId].scouting)
    .toMatchObject({ teamTaskSignals: { defense: true }, customScouting: 'keep' })
})

test.each(['league-a', 'league-b'])('resolves duplicate ownership for %s and preserves source roster/statistics and other team links', leagueId => {
  const actual = fixture()
  const before = JSON.stringify(actual)
  const plan = buildLeagueOwnershipRepairPlan({ actual, finding, input: { leagueId } })
  expect(plan.reason).toBe('')
  expect(plan.allowed).toBe(true)
  expect(JSON.stringify(actual)).toBe(before)
  const patched = { ...actual }
  plan.changes.forEach(change => {
    patched[change.target] = (patched[change.target] || []).filter(row => row.id !== change.documentId)
    if (change.after) patched[change.target].push({ id: change.documentId, data: change.after })
  })
  expect(patched.leagues.filter(row => row.data.seasonsById[seasonId].table.teamsById[teamId]).map(row => row.id)).toEqual([leagueId])
  const updatedTeam = patched.teamSeasons.find(row => row.id === teamSeasonDocumentId).data
  expect(updatedTeam.identity.leagueId).toBe(leagueId)
  expect(patched.teamRoots[0].data.seasonRefsById[seasonId].leagueId).toBe(leagueId)
  expect(patched.teamRoots[0].data.notes).toBe('keep')
  expect(updatedTeam.roster).toEqual(actual.teamSeasons[0].data.roster)
  expect(updatedTeam.stats).toEqual(actual.teamSeasons[0].data.stats)
  expect(patched.playerSeasons[0].data.teamsById.other).toEqual({ leagueId: 'other' })
  expect(patched.playerSeasons[0].data.teamsById[teamId].manual).toEqual({ note: 'keep' })
  expect(patched.playerSearchIndexes[0].data.leagueId).toBe(leagueId)
  expect(evaluateSystemIntegrity(patched).some(item => item.target === 'leagues' && Array.isArray(item.actual))).toBe(false)
})

test('repairs a broken League reference from the single canonical table owner without inventing a League', () => {
  const actual = fixture()
  actual.leagues = [league('league-b')]
  const plan = buildLeagueOwnershipRepairPlan({ actual, finding: {
    target: 'teamSeasons', type: 'broken_relation', owner: 'league', teamId, seasonId,
  } })
  expect(plan.allowed).toBe(true)
  expect(plan.fields).toEqual([])
  expect(plan.changes.find(change => change.target === 'teamSeasons').after.identity.leagueId).toBe('league-b')
  expect(plan.changes.some(change => change.target === 'leagues' && change.before === null)).toBe(false)
})

test('does not offer a destructive repair when a required ClubProfile is missing', () => {
  const actual = fixture()
  actual.clubProfiles = []
  const plan = buildLeagueOwnershipRepairPlan({ actual, finding, input: { leagueId: 'league-b' } })
  expect(plan.allowed).toBe(false)
  expect(plan.changes).toEqual([])
})

test('removing the last team marks the losing league table LOADED_EMPTY', () => {
  const plan = buildLeagueOwnershipRepairPlan({ actual: fixture(), finding, input: { leagueId: 'league-b' } })
  const losingLeague = plan.changes.find(change => change.target === 'leagues' && change.documentId === 'league-a')
  expect(plan.allowed).toBe(true)
  expect(losingLeague.after.seasonsById[seasonId].table).toMatchObject({
    tableState: 'LOADED_EMPTY', teamsById: {},
  })
})

test('blocks before creating orphan indexes when a canonical player has no PlayerSeason', () => {
  const actual = fixture()
  actual.playerSeasons = []
  const plan = buildLeagueOwnershipRepairPlan({ actual, finding, input: { leagueId: 'league-b' } })
  expect(plan.allowed).toBe(false)
  expect(plan.changes).toEqual([])
  expect(plan.reason).toContain('לשחזר תחילה את עונת השחקן')
})

test.each(['league-a', 'league-b'])('resolves the selected team for %s without choosing another ambiguous team owner', leagueId => {
  const actual = fixture()
  const otherTeamId = 'club-b_2010_1'
  const otherTeamSeasonId = `${otherTeamId}__${seasonId}`
  const snapshot = { teamUrl: 'preserved-source-snapshot', officialTable: { rank: 7 }, updatedAt: 'preserved' }
  const otherCenterTeam = { leagueId: 'league-a', teamSeasonDocumentId: otherTeamSeasonId, keep: 'ambiguous existing projection' }
  actual.clubProfiles.push({ id: 'club-b', data: { clubId: 'club-b', names: { display: 'ב' } } })
  actual.leagues.forEach(row => {
    row.data.seasonsById[seasonId].table.teamsById[otherTeamId] = {
      clubId: 'club-b', teamSlot: 1, officialTable: { rank: row.id === 'league-a' ? 2 : 3 },
    }
  })
  actual.teamSeasons.push({ id: otherTeamSeasonId, data: {
    identity: {
      teamSeasonDocumentId: otherTeamSeasonId, teamId: otherTeamId, seasonId,
      clubId: 'club-b', birthYear: 2010, teamSlot: 1, leagueId: 'league-a',
    },
    competitionSnapshot: snapshot,
  } })
  actual.clubsCenter = [{ id: seasonId, data: {
    seasonId, clubsById: { 'club-b': { teamsById: { [otherTeamId]: otherCenterTeam } } },
  } }]
  const plan = buildLeagueOwnershipRepairPlan({ actual, finding, input: { leagueId } })
  expect(plan.allowed).toBe(true)
  const center = plan.changes.find(change => change.target === 'clubsCenter').after
  expect(center.clubsById['club-b'].teamsById[otherTeamId]).toEqual(otherCenterTeam)
  expect(plan.changes.some(change => change.target === 'teamSeasons' && change.documentId === otherTeamSeasonId)).toBe(false)
  const losingLeague = plan.changes.find(change => change.target === 'leagues' && change.documentId !== leagueId).after
  expect(losingLeague.seasonsById[seasonId].table.teamsById[otherTeamId]).toBeDefined()
  expect(losingLeague.seasonsById[seasonId].table.tableState).toBe('LOADED')
})
