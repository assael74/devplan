// src/features/playersDatabase/services/audit/system/repair/systemRepairPlan.test.js

import { buildSystemRepairPlan } from './systemRepairPlan.js'

const teamId = 'club-a_2011_1'
const seasonId = '2026_2027'
const teamSeasonId = `${teamId}__${seasonId}`
const playerId = 'player__2011__12345'
const playerSeasonId = `playerSeason__${playerId}__${seasonId}`
const indexId = `playerSeason__${playerId}__${teamSeasonId}`

const fixture = () => ({
  teamRoots: [{ id: teamId, data: {
    identity: { teamId, clubId: 'club-a', birthYear: 2011, teamSlot: 1 },
    notes: 'keep root note',
    seasonRefsById: { [seasonId]: { teamSeasonDocumentId: teamSeasonId } },
  } }],
  teamSeasons: [{ id: teamSeasonId, data: {
    identity: {
      teamId, seasonId, teamSeasonDocumentId: teamSeasonId,
      clubId: 'club-a', birthYear: 2011, teamSlot: 1,
      leagueId: 'league-a', seasonKey: '26/27', seasonStatus: 'current',
    },
    roster: { playersById: { [playerId]: { externalPlayerId: '12345' } } },
    manual: { note: 'keep manual data' },
  } }],
  playerRoots: [{ id: playerId, data: {
    identity: { playerId, birthYear: 2011, externalPlayerId: '12345' },
    notes: 'keep player note',
    seasonRefsById: { [seasonId]: { playerSeasonDocumentId: playerSeasonId } },
  } }],
  playerSeasons: [{ id: playerSeasonId, data: {
    identity: { playerId, seasonId, playerSeasonDocumentId: playerSeasonId },
    teamsById: { [teamId]: { teamSeasonDocumentId: teamSeasonId, stats: { keep: true } } },
  } }],
  playerSearchIndexes: [{ id: indexId, data: {
    playerId, seasonId,
    references: { teamSeasonDocumentId: teamSeasonId, playerSeasonDocumentId: playerSeasonId },
    player: { notes: 'keep projection text' },
  } }],
  leagues: [{ id: 'league-a', data: {
    leagueId: 'league-a',
    seasonsById: { [seasonId]: { table: { teamsById: { [teamId]: { teamId, clubId: 'club-a' } } } } },
  } }],
  clubProfiles: [{ id: 'club-a', data: { clubId: 'club-a', names: { display: 'מועדון א' } } }],
  clubsDirectory: [{ id: 'all', data: { clubsById: { stale: { names: { display: 'ישן' } } } } }],
})

const planFor = (actual, finding) => buildSystemRepairPlan({ actual, finding })
const written = (plan, target, id) => plan.changes.find(item => item.target === target && item.documentId === id && item.after)

test('rebuilds Directory from ClubProfiles and removes stale projections without changing sources', () => {
  const actual = fixture()
  const before = JSON.stringify(actual)
  const plan = planFor(actual, { target: 'clubsDirectory', type: 'projection_mismatch', documentId: 'all' })
  expect(plan.allowed).toBe(true)
  expect(Object.keys(plan.changes[0].after.clubsById)).toEqual(['club-a'])
  expect(plan.changes[0].after.clubsById['club-a'].names.display).toBe('מועדון א')
  expect(plan.guards.map(item => item.target)).toEqual(['clubProfiles'])
  expect(JSON.stringify(actual)).toBe(before)
})

test('deleting an unexpected Directory document also rebuilds the canonical all document', () => {
  const actual = fixture()
  actual.clubsDirectory.push({ id: 'extra', data: { keep: 'only projection' } })
  const plan = planFor(actual, { target: 'clubsDirectory', type: 'unexpected_projection', documentId: 'extra' })
  expect(plan.allowed).toBe(true)
  expect(plan.changes.map(item => [item.documentId, item.after === null])).toEqual([
    ['all', false], ['extra', true],
  ])
})

test('Directory rebuild blocks profiles whose canonical identity is inconsistent', () => {
  const actual = fixture()
  actual.clubProfiles[0].data.clubId = 'wrong'
  expect(planFor(actual, { target: 'clubsDirectory', type: 'missing_projection' }).allowed).toBe(false)
})

test('repairs a root reference from the existing TeamSeason, preserving other seasons and notes', () => {
  const actual = fixture()
  actual.teamRoots[0].data.seasonRefsById[seasonId].teamSeasonDocumentId = 'bad'
  actual.teamRoots[0].data.seasonRefsById.previous = { untouched: true }
  const plan = planFor(actual, { type: 'broken_relation', target: 'teamRoots', documentId: teamId, seasonId })
  const after = plan.changes[0].after
  expect(plan.allowed).toBe(true)
  expect(after.notes).toBe('keep root note')
  expect(after.seasonRefsById.previous).toEqual({ untouched: true })
  expect(after.seasonRefsById[seasonId].teamSeasonDocumentId).toBe(teamSeasonId)
  expect(plan.guards[0].documentId).toBe(teamSeasonId)
})

test('missing reference targets are delegated to the source planner without invented data', () => {
  const actual = fixture()
  actual.teamSeasons = []
  const plan = planFor(actual, { type: 'broken_relation', target: 'teamRoots', documentId: teamId, seasonId })
  expect(plan.supported).toBe(false)
  expect(plan.changes).toEqual([])
})

test('repairs PlayerSeason links only when TeamSeason canonically contains the player', () => {
  const actual = fixture()
  actual.playerSeasons[0].data.teamsById[teamId].teamSeasonDocumentId = 'bad'
  const finding = { type: 'broken_relation', target: 'playerSeasons', documentId: playerSeasonId, teamId }
  const plan = planFor(actual, finding)
  expect(plan.changes[0].after.teamsById[teamId]).toEqual({ teamSeasonDocumentId: teamSeasonId, stats: { keep: true } })
  actual.teamSeasons[0].data.roster.playersById = {}
  expect(planFor(actual, finding).allowed).toBe(false)
})

test('SearchIndex references and season are corrected from TeamSeason without touching player data', () => {
  const actual = fixture()
  actual.playerSearchIndexes[0].data.seasonId = '2025_2026'
  actual.playerSearchIndexes[0].data.references.playerSeasonDocumentId = 'bad'
  const plan = planFor(actual, { type: 'broken_relation', target: 'playerSearchIndexes', documentId: indexId })
  expect(plan.allowed).toBe(true)
  expect(plan.changes[0].after.seasonId).toBe(seasonId)
  expect(plan.changes[0].after.references.playerSeasonDocumentId).toBe(playerSeasonId)
  expect(plan.changes[0].after.player.notes).toBe('keep projection text')
})

test('fixes an identity field in place without changing timestamps or unrelated data', () => {
  const actual = fixture()
  const timestamp = new Date('2026-10-11T01:00:00Z')
  actual.teamRoots[0].data.identity.teamId = 'bad'
  actual.teamRoots[0].data.timestamps = { updatedAt: timestamp }
  const plan = planFor(actual, { type: 'invalid_identity', target: 'teamRoots', documentId: teamId })
  expect(plan.allowed).toBe(true)
  expect(plan.changes).toHaveLength(1)
  expect(plan.changes[0].after.identity.teamId).toBe(teamId)
  expect(plan.changes[0].after.timestamps.updatedAt).toBe(timestamp)
})

test('moves a TeamSeason and its indexes while updating explicit links and preserving movement ids', () => {
  const actual = fixture()
  const oldId = 'wrong-team-season-id'
  actual.teamSeasons[0].id = oldId
  actual.teamSeasons[0].data.identity.teamSeasonDocumentId = oldId
  actual.teamSeasons[0].data.movement = {
    transfersInById: { stable: { movementId: 'stable', toTeamSeasonDocumentId: oldId, note: oldId } },
  }
  actual.teamRoots[0].data.seasonRefsById[seasonId].teamSeasonDocumentId = oldId
  actual.playerSeasons[0].data.teamsById[teamId].teamSeasonDocumentId = oldId
  actual.playerSearchIndexes[0].id = `playerSeason__${playerId}__${oldId}`
  actual.playerSearchIndexes[0].data.references.teamSeasonDocumentId = oldId
  const plan = planFor(actual, { type: 'invalid_identity', target: 'teamSeasons', documentId: oldId })
  expect(plan.allowed).toBe(true)
  expect(written(plan, 'teamSeasons', teamSeasonId).after.manual.note).toBe('keep manual data')
  expect(written(plan, 'teamSeasons', teamSeasonId).after.movement.transfersInById.stable).toEqual({
    movementId: 'stable', toTeamSeasonDocumentId: teamSeasonId, note: oldId,
  })
  expect(written(plan, 'teamRoots', teamId).after.seasonRefsById[seasonId].teamSeasonDocumentId).toBe(teamSeasonId)
  expect(written(plan, 'playerSearchIndexes', indexId).after.references.teamSeasonDocumentId).toBe(teamSeasonId)
  expect(plan.changes.some(item => item.documentId === oldId && item.after === null)).toBe(true)
})

test('moves a PlayerRoot and dependent documents and canonical player-map keys together', () => {
  const actual = fixture()
  const oldId = 'legacy-player'
  actual.playerRoots[0].id = oldId
  actual.playerRoots[0].data.identity.playerId = oldId
  actual.teamSeasons[0].data.roster.playersById = { [oldId]: { externalPlayerId: '12345' } }
  actual.playerSeasons[0].id = `playerSeason__${oldId}__${seasonId}`
  actual.playerSeasons[0].data.identity.playerId = oldId
  actual.playerSeasons[0].data.identity.playerSeasonDocumentId = actual.playerSeasons[0].id
  actual.playerRoots[0].data.seasonRefsById[seasonId].playerSeasonDocumentId = actual.playerSeasons[0].id
  actual.playerSearchIndexes[0].id = `playerSeason__${oldId}__${teamSeasonId}`
  actual.playerSearchIndexes[0].data.playerId = oldId
  actual.playerSearchIndexes[0].data.references.playerSeasonDocumentId = actual.playerSeasons[0].id
  const before = JSON.stringify(actual)
  const plan = planFor(actual, { type: 'invalid_identity', target: 'playerRoots', documentId: oldId })
  expect(plan.allowed).toBe(true)
  expect(written(plan, 'playerRoots', playerId).after.notes).toBe('keep player note')
  expect(written(plan, 'teamSeasons', teamSeasonId).after.roster.playersById[playerId]).toEqual({ externalPlayerId: '12345' })
  expect(written(plan, 'playerSearchIndexes', indexId).after.references.playerSeasonDocumentId).toBe(playerSeasonId)
  expect(JSON.stringify(actual)).toBe(before)
})

test('blocks document-id migration when the destination already exists', () => {
  const actual = fixture()
  actual.playerSeasons.push({ id: 'bad', data: actual.playerSeasons[0].data })
  const plan = planFor(actual, { type: 'invalid_identity', target: 'playerSeasons', documentId: 'bad' })
  expect(plan.allowed).toBe(false)
  expect(plan.changes).toEqual([])
  expect(plan.reason).toContain('מזהה היעד')
})

test('blocks migration when canonical map keys would collide', () => {
  const actual = fixture()
  actual.playerRoots[0].id = 'legacy-player'
  actual.teamSeasons[0].data.roster.playersById['legacy-player'] = { externalPlayerId: '12345' }
  const plan = planFor(actual, { type: 'invalid_identity', target: 'playerRoots', documentId: 'legacy-player' })
  expect(plan.allowed).toBe(false)
  expect(plan.changes).toEqual([])
})

test('league and club identity repairs keep their document ids and independent fields', () => {
  const actual = fixture()
  actual.leagues[0].data.leagueId = 'bad'
  const plan = planFor(actual, { type: 'invalid_identity', target: 'leagues', documentId: 'league-a' })
  expect(plan.changes[0].after.leagueId).toBe('league-a')
  expect(plan.changes[0].after.seasonsById).toBe(actual.leagues[0].data.seasonsById)
})

test('reconstructs a missing PlayerSeason from every canonical team context and repairs its root reference', () => {
  const actual = fixture()
  actual.playerSeasons = []
  actual.playerRoots[0].data.seasonRefsById.previous = { keep: true }
  const secondId = 'club-b_2011_1'
  const secondSeasonId = `${secondId}__${seasonId}`
  actual.teamSeasons.push({ id: secondSeasonId, data: {
    identity: {
      teamId: secondId, teamSeasonDocumentId: secondSeasonId, seasonId,
      clubId: 'club-b', birthYear: 2011, teamSlot: 1,
      seasonKey: '26/27', seasonStatus: 'current', leagueId: 'league-b',
    },
    stats: { playersById: { [playerId]: { statsStatus: 'loaded', playerStats: { goals: 4 } } } },
    scouting: { playersById: { [playerId]: { primary: { profileId: 'striker' } } } },
  } })
  const plan = planFor(actual, { type: 'broken_relation', target: 'playerRoots', documentId: playerId, seasonId })
  expect(plan.allowed).toBe(true)
  const season = written(plan, 'playerSeasons', playerSeasonId).after
  expect(Object.keys(season.teamsById)).toEqual([teamId, secondId])
  expect(season.teamsById[secondId].stats.playerStats.goals).toBe(4)
  expect(season.teamsById[secondId].scouting.primary.profileId).toBe('striker')
  expect(written(plan, 'playerRoots', playerId).after.seasonRefsById.previous).toEqual({ keep: true })
  expect(plan.guards.filter(item => item.target === 'teamSeasons')).toHaveLength(2)
})

test('missing PlayerSeason audit finding uses canonical roster fields and does not require a PlayerRoot', () => {
  const actual = fixture()
  actual.playerSeasons = []
  actual.playerRoots = []
  const plan = planFor(actual, { type: 'missing_projection', target: 'playerSeasons', playerId, seasonId, documentId: playerSeasonId })
  expect(plan.allowed).toBe(true)
  expect(plan.changes).toHaveLength(1)
  expect(plan.changes[0].after.teamsById[teamId].teamSeasonDocumentId).toBe(teamSeasonId)
})

test('SearchIndex with missing PlayerSeason is repaired together with the reconstructed projection', () => {
  const actual = fixture()
  actual.playerSeasons = []
  const plan = planFor(actual, { type: 'orphan_projection', target: 'playerSearchIndexes', documentId: indexId })
  expect(plan.allowed).toBe(true)
  expect(written(plan, 'playerSeasons', playerSeasonId).after.identity.playerId).toBe(playerId)
  expect(written(plan, 'playerSearchIndexes', indexId).after.references.playerSeasonDocumentId).toBe(playerSeasonId)
  expect(plan.guards.some(item => item.target === 'playerSeasons')).toBe(false)
})

test('missing PlayerSeason without canonical membership blocks instead of creating an empty projection', () => {
  const actual = fixture()
  actual.playerSeasons = []
  actual.teamSeasons[0].data.roster.playersById = {}
  const plan = planFor(actual, { type: 'broken_relation', target: 'playerRoots', documentId: playerId, seasonId })
  expect(plan.supported).toBe(true)
  expect(plan.allowed).toBe(false)
  expect(plan.reason).toContain('אין עונת קבוצה קנונית')
})

test('index identity repair requires canonical player membership and cannot rely on projection references alone', () => {
  const actual = fixture()
  actual.playerSearchIndexes[0].id = 'wrong-index-id'
  const finding = { type: 'invalid_identity', target: 'playerSearchIndexes', documentId: 'wrong-index-id' }
  expect(planFor(actual, finding).allowed).toBe(true)
  actual.teamSeasons[0].data.roster.playersById = {}
  expect(planFor(actual, finding).allowed).toBe(false)
})

test('moves TeamRoot with catalog-shaped TeamSeason identity and all related team-map keys', () => {
  const actual = fixture()
  const oldId = 'legacy-team'
  const oldSeasonId = `${oldId}__${seasonId}`
  actual.teamRoots[0].id = oldId
  actual.teamRoots[0].data.identity.teamId = oldId
  actual.teamRoots[0].data.seasonRefsById[seasonId].teamSeasonDocumentId = oldSeasonId
  actual.teamSeasons[0].id = oldSeasonId
  actual.teamSeasons[0].data.identity.teamId = oldId
  actual.teamSeasons[0].data.identity.teamSeasonDocumentId = oldSeasonId
  actual.playerSeasons[0].data.teamsById = { [oldId]: { teamSeasonDocumentId: oldSeasonId } }
  actual.leagues[0].data.seasonsById[seasonId].table.teamsById = { [oldId]: { teamId: oldId, clubId: 'club-a' } }
  actual.playerSearchIndexes[0].id = `playerSeason__${playerId}__${oldSeasonId}`
  actual.playerSearchIndexes[0].data.references.teamSeasonDocumentId = oldSeasonId
  const plan = planFor(actual, { type: 'invalid_identity', target: 'teamRoots', documentId: oldId })
  expect(plan.allowed).toBe(true)
  expect(written(plan, 'teamRoots', teamId).after.identity.teamId).toBe(teamId)
  expect(written(plan, 'teamSeasons', teamSeasonId).after.identity.teamId).toBe(teamId)
  expect(written(plan, 'leagues', 'league-a').after.seasonsById[seasonId].table.teamsById[teamId].teamId).toBe(teamId)
})
