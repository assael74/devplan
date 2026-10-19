// src/features/playersDatabase/services/audit/system/evaluate.test.js

import { evaluateSystemIntegrity } from './evaluate.js'
import { buildTeamSignalSummary } from '../../../domain/signals/teamSignalSummary.js'

const seasonId = '2026_2027'
const clubId = 'club-a'
const teamId = `${clubId}_2011_1`
const teamSeasonDocumentId = `${teamId}__${seasonId}`
const playerId = 'player__2011__12345'
const playerSeasonDocumentId = `playerSeason__${playerId}__${seasonId}`
const searchIndexDocumentId = `playerSeason__${playerId}__${teamSeasonDocumentId}`

const cleanActual = () => ({
  clubProfiles: [{ id: clubId, data: { clubId } }],
  leagues: [{
    id: 'league-a',
    data: { leagueId: 'league-a', seasonsById: { [seasonId]: { seasonKey: '26/27' } } },
  }],
  teamRoots: [{
    id: teamId,
    data: {
      identity: { teamId, clubId, birthYear: 2011, teamSlot: 1 },
      seasonRefsById: {
        [seasonId]: { teamSeasonDocumentId, leagueId: 'league-a' },
      },
    },
  }],
  teamSeasons: [{
    id: teamSeasonDocumentId,
    data: {
      identity: {
        teamSeasonDocumentId,
        teamId,
        seasonId,
        clubId,
        birthYear: 2011,
        teamSlot: 1,
        leagueId: 'league-a',
      },
      roster: { playersById: { [playerId]: { externalPlayerId: '12345' } } },
    },
  }],
  playerRoots: [],
  playerSeasons: [{
    id: playerSeasonDocumentId,
    data: {
      identity: { playerSeasonDocumentId, playerId, seasonId },
      teamsById: { [teamId]: { teamSeasonDocumentId } },
    },
  }],
  playerSearchIndexes: [{
    id: searchIndexDocumentId,
    data: {
      playerId,
      seasonId,
      references: { playerSeasonDocumentId, teamSeasonDocumentId },
    },
  }],
  leaguesCenter: [{
    id: 'all',
    data: {
      leaguesById: {
        'league-a': {
          identity: {
            leagueName: '',
            region: '',
            ageGroupId: '',
            ageGroupLabel: '',
            level: null,
          },
          seasonsById: {
            [seasonId]: {
              seasonKey: '26/27',
              seasonStatus: '',
              birthYear: null,
              seasonUrl: '',
              hasCompetitionRules: false,
              tableState: '',
              tableImportedAt: null,
              teamsById: {},
              updatedAt: null,
            },
          },
        },
      },
    },
  }],
  clubsCenter: [{
    id: seasonId,
    data: {
      seasonId,
      seasonKey: '26/27',
      seasonStatus: '',
      leaguesById: {
        'league-a': {
          displayName: '',
          ageGroupLabel: '',
          leagueLevel: null,
          seasonStatus: '',
          tableImportedAt: null,
        },
      },
      clubsById: {},
    },
  }],
  clubsDirectory: [{
    id: 'all',
    data: {
      clubsById: {
        [clubId]: {
          names: { official: '', display: '', short: '' },
          aliases: [],
          searchAliases: [],
          clubUrl: '',
          clubLevel: null,
          clubStrengthLevel: null,
          updatedAt: null,
        },
      },
    },
  }],
})

describe('evaluateSystemIntegrity', () => {
  test('recomputes from canonical club and league data even when all four saved summaries agree', () => {
    const actual = cleanActual()
    const summary = buildTeamSignalSummary({ computedAt: 'saved time' })
    actual.clubProfiles[0].data.clubLevel = 1
    actual.leagues[0].data.level = 3
    actual.leagues[0].data.ageGroupId = 'u15'
    actual.leagues[0].data.seasonsById[seasonId].birthYear = 2011
    actual.leagues[0].data.seasonsById[seasonId].table = { teamsById: {
      [teamId]: { clubId, teamSlot: 1, teamSignalSummary: summary },
    } }
    actual.teamSeasons[0].data.teamSignalSummary = summary
    actual.leaguesCenter[0].data.leaguesById['league-a'].seasonsById[seasonId].teamsById[teamId] = {
      teamSignalSummary: summary,
    }
    actual.clubsCenter[0].data.clubsById[clubId] = { teamsById: {
      [teamId]: { teamSignalSummary: summary },
    } }
    const original = JSON.stringify(actual)
    const findings = evaluateSystemIntegrity(actual).filter(item => item.owner === 'teamSignals')
    expect(findings).toEqual([expect.objectContaining({
      target: 'teamSeasons',
      expected: expect.objectContaining({ familiesById: expect.objectContaining({
        'club-gap': expect.objectContaining({ level: 1 }),
      }) }),
    })])
    expect(JSON.stringify(actual)).toBe(original)
  })

  test('checks summary parity and calibration while ignoring retained legacy task flags', () => {
    const actual = cleanActual()
    const summary = buildTeamSignalSummary()
    actual.leagues[0].data.seasonsById[seasonId].table = {
      teamsById: { [teamId]: { clubId, teamSlot: 1, teamSignalSummary: summary } },
    }
    actual.teamSeasons[0].data.teamSignalSummary = summary
    actual.teamSeasons[0].data.teamTaskSignals = { offense: true }
    actual.leaguesCenter[0].data.leaguesById['league-a'].seasonsById[seasonId].teamsById[teamId] = {
      teamSignalSummary: summary, teamTaskSignals: { offense: false },
    }
    actual.clubsCenter[0].data.clubsById[clubId] = { teamsById: {
      [teamId]: { teamSignalSummary: summary },
    } }
    const signalFindings = () => evaluateSystemIntegrity(actual).filter(finding => finding.owner === 'teamSignals')
    expect(signalFindings()).toEqual([])
    actual.clubsCenter[0].data.clubsById[clubId].teamsById[teamId].teamSignalSummary = null
    expect(signalFindings()).toEqual([expect.objectContaining({ target: 'clubsCenter' })])
    actual.teamSeasons[0].data.teamSignalSummary = { ...summary, calibrationVersion: 'old' }
    expect(signalFindings()).toEqual(expect.arrayContaining([
      expect.objectContaining({ target: 'teamSeasons', owner: 'teamSignals' }),
    ]))
  })

  test('reports a missing current summary even when legacy flags still exist', () => {
    const actual = cleanActual()
    actual.leagues[0].data.seasonsById[seasonId].table = { teamsById: {
      [teamId]: { clubId, teamTaskSignals: { offense: true } },
    } }
    expect(evaluateSystemIntegrity(actual)).toEqual(expect.arrayContaining([
      expect.objectContaining({ owner: 'teamSignals', title: 'סיכום האיתותים חסר או אינו מסונכרן' }),
    ]))
  })
  test('accepts a roster-only player without requiring Player Root', () => {
    expect(evaluateSystemIntegrity(cleanActual())).toEqual([])
  })

  test('ignores object key order when projections contain the same values', () => {
    const actual = cleanActual()
    actual.leaguesCenter[0].data.leaguesById['league-a'].identity = {
      level: null,
      ageGroupLabel: '',
      ageGroupId: '',
      region: '',
      leagueName: '',
    }

    expect(evaluateSystemIntegrity(actual)).toEqual([])
  })

  test('reports Player Root only when Stats or scouting owns player state', () => {
    const actual = cleanActual()
    actual.teamSeasons[0].data.stats = {
      playersById: { [playerId]: { statsStatus: 'loaded' } },
    }

    const findings = evaluateSystemIntegrity(actual)

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'missing_canonical',
        target: 'playerRoots',
        documentId: playerId,
        owner: 'stats',
      }),
    ]))
  })

  test('reports deterministic identity and orphan projection failures', () => {
    const actual = cleanActual()
    actual.teamRoots[0].data.identity.teamSlot = null
    actual.playerSeasons[0].data.teamsById[teamId].teamSeasonDocumentId = 'missing-team-season'
    actual.playerSearchIndexes[0].data.references.playerSeasonDocumentId = 'missing-player-season'

    const findings = evaluateSystemIntegrity(actual)

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'invalid_identity', target: 'teamRoots' }),
      expect.objectContaining({ type: 'broken_relation', target: 'playerSeasons' }),
      expect.objectContaining({ type: 'orphan_projection', target: 'playerSearchIndexes' }),
    ]))
  })

  test('reports a Player Season team relation as orphan when Team Season is absent', () => {
    const actual = cleanActual()
    actual.teamSeasons = []

    const findings = evaluateSystemIntegrity(actual)

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'orphan_projection',
        target: 'playerSeasons',
        documentId: playerSeasonDocumentId,
        teamId,
      }),
    ]))
  })

  test('reports a Player Season team relation as orphan when the player is absent from Team Season', () => {
    const actual = cleanActual()
    actual.teamSeasons[0].data.roster.playersById = {}

    const findings = evaluateSystemIntegrity(actual)

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'orphan_projection',
        target: 'playerSeasons',
        documentId: playerSeasonDocumentId,
        playerId,
        teamId,
      }),
    ]))
  })

  test('reports missing owner projections for a Team Season player', () => {
    const actual = cleanActual()
    actual.playerSeasons = []
    actual.playerSearchIndexes = []

    const findings = evaluateSystemIntegrity(actual)

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'missing_projection', target: 'playerSeasons' }),
      expect.objectContaining({ type: 'missing_projection', target: 'playerSearchIndexes' }),
    ]))
  })

  test('validates Player Root identity and season references when it exists', () => {
    const actual = cleanActual()
    actual.playerRoots = [{
      id: playerId,
      data: {
        identity: {
          playerId,
          birthYear: 2011,
          externalPlayerId: '12345',
        },
        seasonRefsById: {
          [seasonId]: { playerSeasonDocumentId: 'wrong-id' },
        },
      },
    }]

    const findings = evaluateSystemIntegrity(actual)

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        target: 'playerRoots',
        documentId: playerId,
        relatedDocumentId: 'wrong-id',
      }),
    ]))
  })

  test('reports a pending player who is already present in the canonical roster', () => {
    const actual = cleanActual()
    actual.teamSeasons[0].data.roster.pendingById = {
      [playerId]: { playerId },
    }

    const findings = evaluateSystemIntegrity(actual)

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'invalid_canonical_state',
        target: 'teamSeasons',
        documentId: teamSeasonDocumentId,
        playerId,
        owner: 'roster',
      }),
    ]))
  })

  test('reports a Movement fact whose id differs from its canonical map key', () => {
    const actual = cleanActual()
    actual.teamSeasons[0].data.movement = {
      transfersInById: {
        'movement-key': {
          movementId: 'different-movement-id',
          playerId,
        },
      },
    }

    const findings = evaluateSystemIntegrity(actual)

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'invalid_identity',
        target: 'teamSeasons',
        documentId: teamSeasonDocumentId,
        relatedDocumentId: 'different-movement-id',
        expected: 'movement-key',
        actual: 'different-movement-id',
        owner: 'roster',
      }),
    ]))
  })

  test('reports missing global and season center projections', () => {
    const actual = cleanActual()
    actual.leaguesCenter = []
    actual.clubsCenter = []

    const findings = evaluateSystemIntegrity(actual)

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'missing_projection', target: 'leaguesCenter' }),
      expect.objectContaining({ type: 'missing_projection', target: 'clubsCenter' }),
    ]))
  })

  test('reports a ClubsDirectory projection mismatch', () => {
    const actual = cleanActual()
    actual.clubProfiles[0].data.clubUrl = 'https://canonical.example'

    const findings = evaluateSystemIntegrity(actual)

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'projection_mismatch', target: 'clubsDirectory' }),
    ]))
  })

  test('reports one canonical ownership finding when a team appears in two leagues', () => {
    const actual = cleanActual()
    actual.leagues[0].data.seasonsById[seasonId].table = {
      teamsById: {
        [teamId]: { clubId },
      },
    }
    actual.leagues.push({
      id: 'league-b',
      data: {
        leagueId: 'league-b',
        seasonsById: {
          [seasonId]: {
            seasonKey: '26/27',
            table: {
              teamsById: {
                [teamId]: { clubId },
              },
            },
          },
        },
      },
    })
    actual.clubsCenter[0].data.leaguesById['league-b'] = {
      displayName: '',
      ageGroupLabel: '',
      leagueLevel: null,
      seasonStatus: '',
      tableImportedAt: null,
    }

    const findings = evaluateSystemIntegrity(actual)

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'broken_relation',
        target: 'leagues',
        documentId: seasonId,
        relatedDocumentId: teamId,
        actual: ['league-a', 'league-b'],
      }),
    ]))
    expect(findings).not.toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'projection_mismatch',
        target: 'clubsCenter',
        relatedDocumentId: teamId,
      }),
    ]))
  })
})
