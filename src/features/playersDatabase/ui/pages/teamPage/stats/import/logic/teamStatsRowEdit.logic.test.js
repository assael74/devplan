// src/features/playersDatabase/ui/pages/teamPage/stats/import/logic/teamStatsRowEdit.logic.test.js

import { STATS_IDENTITY_STATUS } from '../../shared/logic/teamStatsMatch.logic.js'
import {
  applyMovementDecision,
  applyRosterMatchEdit,
  applyRosterStatusEdit,
  applyStatsCellEdit,
  applySystemCandidateApproval,
  updateStatsImportRow,
} from './teamStatsRowEdit.logic.js'

const rowWithCorrection = overrides => ({
  fullName: 'שחקן בדיקה',
  statsMinutesCorrection: { amount: 10 },
  ...overrides,
})

const validTeam = {
  birthTeamDocumentId: 'team-1',
  clubId: 'club-1',
}

describe('Stats import row edits', () => {
  test('selecting an existing roster player preserves correction, aliases, and roster context', () => {
    const result = applyRosterMatchEdit({
      row: rowWithCorrection({ originalFullName: 'שם מודבק', aliases: ['כינוי קודם'] }),
      value: 'doc-1',
      players: [{
        playerId: 'player-1',
        playerDocumentId: 'doc-1',
        externalPlayerId: '123',
        fullName: 'שם שחקן קיים',
        rosterStatus: 'regular',
      }],
    })

    expect(result).toMatchObject({
      playerId: 'player-1',
      playerDocumentId: 'doc-1',
      externalPlayerId: '123',
      fullName: 'שם שחקן קיים',
      originalFullName: 'שם מודבק',
      aliases: ['כינוי קודם', 'שם מודבק'],
      matchedPlayerId: 'doc-1',
      matchedPlayerName: 'שם שחקן קיים',
      rosterStatus: 'regular',
      isYoungerAgeGroup: false,
      isNameAlias: true,
      identityStatus: STATS_IDENTITY_STATUS.ROSTER_MATCH,
      identityResolution: '',
      identityMessage: 'נבחר ידנית מתוך הסגל',
      statsMinutesCorrection: { amount: 10 },
    })
  })

  test('selecting a younger-age-group roster player keeps its roster status and correction', () => {
    const result = applyRosterMatchEdit({
      row: rowWithCorrection(),
      value: 'player-young',
      players: [{ playerId: 'player-young', fullName: 'שחקן צעיר', rosterStatus: 'youngerAgeGroup' }],
    })

    expect(result).toMatchObject({
      rosterStatus: 'youngerAgeGroup',
      isYoungerAgeGroup: true,
      identityStatus: STATS_IDENTITY_STATUS.ROSTER_MATCH,
      statsMinutesCorrection: { amount: 10 },
    })
  })

  test('create-new roster match resets match fields without removing correction', () => {
    const result = applyRosterMatchEdit({
      row: rowWithCorrection({ originalFullName: 'שחקן חדש', matchedPlayerId: 'old-player', matchedPlayerName: 'שחקן קודם' }),
      value: '__createNew',
      players: [],
    })

    expect(result).toMatchObject({
      fullName: 'שחקן חדש',
      matchedPlayerId: '',
      matchedPlayerName: '',
      identityResolution: 'createNew',
      rosterStatus: 'regular',
      identityStatus: STATS_IDENTITY_STATUS.NEW_PLAYER,
      identityMessage: 'אושר במפורש כשחקן חדש',
      statsMinutesCorrection: { amount: 10 },
    })
  })

  test('invalid roster selection preserves correction while marking the row unresolved', () => {
    const result = applyRosterMatchEdit({
      row: rowWithCorrection({
        matchedPlayerId: 'old-player',
        matchedPlayerName: 'שחקן קודם',
        identityResolution: 'createNew',
      }),
      value: 'missing-player',
      players: [],
    })

    expect(result).toMatchObject({
      matchedPlayerId: '',
      matchedPlayerName: '',
      rosterStatus: 'unresolved',
      identityStatus: STATS_IDENTITY_STATUS.UNRESOLVED,
      identityResolution: '',
      identityMessage: 'לא נבחר שחקן',
      statsMinutesCorrection: { amount: 10 },
    })
  })

  test.each([
    ['joined', { playerId: 'player-1' }, 'regular', 'useSystemCandidate', 'matched'],
    ['left', {}, 'left', 'createNew', 'created'],
    ['youngerAgeGroup', {}, 'youngerAgeGroup', 'createNew', 'created'],
  ])('movement decision %s preserves the established row fields and correction', (
    decision,
    rowOverrides,
    rosterStatus,
    identityResolution,
    identityMatchStatus,
  ) => {
    const result = applyMovementDecision({
      row: rowWithCorrection(rowOverrides),
      value: { decision, team: decision === 'youngerAgeGroup' ? null : validTeam },
    })

    expect(result).toMatchObject({
      rosterStatus,
      isYoungerAgeGroup: decision === 'youngerAgeGroup',
      statsMovementDecision: decision,
      statsMovementTeam: decision === 'youngerAgeGroup' ? null : validTeam,
      requiresStatsMovementDecision: false,
      identityResolution,
      identityMatchStatus,
      statsMinutesCorrection: { amount: 10 },
    })
  })

  test.each([
    { decision: 'joined', team: null },
    { decision: 'left', team: null },
    { decision: 'invalid', team: validTeam },
  ])('invalid movement decision returns the original row', value => {
    const row = rowWithCorrection()

    expect(applyMovementDecision({ row, value })).toBe(row)
  })

  test('valid system candidate approval updates every established identity field and keeps correction', () => {
    const result = applySystemCandidateApproval({
      row: rowWithCorrection({
        rosterStatus: 'unresolved',
        identityCandidates: [{ candidateKey: 'candidate-1', playerId: 'player-1', playerDocumentId: 'doc-1' }],
      }),
      value: 'candidate-1',
    })

    expect(result).toMatchObject({
      playerDocumentId: 'doc-1',
      approvedPlayerDocumentId: 'doc-1',
      approvedIdentityCandidateId: 'player-1',
      approvedCanonicalPlayerId: 'player-1',
      identityResolution: 'useSystemCandidate',
      rosterStatus: 'regular',
      identityStatus: STATS_IDENTITY_STATUS.SYSTEM_MATCH,
      identityMessage: 'התאמה קיימת אושרה',
      statsMinutesCorrection: { amount: 10 },
    })
  })

  test('invalid system candidate approval returns the original row', () => {
    const row = rowWithCorrection({ identityCandidates: [] })

    expect(applySystemCandidateApproval({ row, value: 'missing' })).toBe(row)
  })

  test('regular roster status confirms NEW_PLAYER identity and removes correction', () => {
    const result = applyRosterStatusEdit({
      row: rowWithCorrection({
        identityStatus: STATS_IDENTITY_STATUS.NEW_PLAYER,
        statsMovementDecision: 'joined',
        statsMovementTeam: validTeam,
        requiresStatsMovementDecision: true,
      }),
      value: 'regular',
    })

    expect(result).toMatchObject({
      rosterStatus: 'regular',
      isYoungerAgeGroup: false,
      statsMovementDecision: '',
      statsMovementTeam: null,
      requiresStatsMovementDecision: false,
      identityResolution: 'createNew',
      identityMatchStatus: 'created',
      identityStatus: STATS_IDENTITY_STATUS.NEW_PLAYER,
      identityMessage: 'יצירת שחקן חדש אושרה לפי סטטוס הסגל',
    })
    expect(result.statsMinutesCorrection).toBeUndefined()
  })

  test('roster status joined requires a movement decision and keeps unresolved identity fields', () => {
    const result = applyRosterStatusEdit({
      row: rowWithCorrection({ identityStatus: STATS_IDENTITY_STATUS.UNRESOLVED, identityResolution: 'prior-resolution' }),
      value: 'joined',
    })

    expect(result).toMatchObject({
      rosterStatus: 'regular',
      isYoungerAgeGroup: false,
      statsMovementDecision: 'joined',
      statsMovementTeam: null,
      requiresStatsMovementDecision: true,
      identityStatus: STATS_IDENTITY_STATUS.UNRESOLVED,
      identityResolution: 'prior-resolution',
      identityMessage: 'בחר קבוצת מקור כדי לאשר הצטרפות',
    })
    expect(result.statsMinutesCorrection).toBeUndefined()
  })

  test('roster status left requires a movement decision and keeps unresolved identity fields', () => {
    const result = applyRosterStatusEdit({
      row: rowWithCorrection({ identityStatus: STATS_IDENTITY_STATUS.UNRESOLVED, identityResolution: 'prior-resolution' }),
      value: 'left',
    })

    expect(result).toMatchObject({
      rosterStatus: 'left',
      isYoungerAgeGroup: false,
      statsMovementDecision: 'left',
      statsMovementTeam: null,
      requiresStatsMovementDecision: true,
      identityStatus: STATS_IDENTITY_STATUS.UNRESOLVED,
      identityResolution: 'prior-resolution',
      identityMessage: 'בחר קבוצת יעד כדי לאשר עזיבה',
    })
    expect(result.statsMinutesCorrection).toBeUndefined()
  })

  test('younger-age-group roster status confirms unresolved identity as a new player', () => {
    const result = applyRosterStatusEdit({
      row: rowWithCorrection({ identityStatus: STATS_IDENTITY_STATUS.UNRESOLVED }),
      value: 'youngerAgeGroup',
    })

    expect(result).toMatchObject({
      rosterStatus: 'youngerAgeGroup',
      isYoungerAgeGroup: true,
      statsMovementDecision: '',
      statsMovementTeam: null,
      requiresStatsMovementDecision: false,
      identityResolution: 'createNew',
      identityMatchStatus: 'created',
      identityStatus: STATS_IDENTITY_STATUS.NEW_PLAYER,
      identityMessage: 'יצירת שחקן חדש אושרה לפי סטטוס הסגל',
    })
    expect(result.statsMinutesCorrection).toBeUndefined()
  })

  test('empty roster status stays unresolved and clears explicit new-player identity fields', () => {
    const result = applyRosterStatusEdit({
      row: rowWithCorrection({
        identityStatus: STATS_IDENTITY_STATUS.UNRESOLVED,
        identityResolution: 'createNew',
        identityMatchStatus: 'created',
      }),
      value: '',
    })

    expect(result).toMatchObject({
      rosterStatus: 'unresolved',
      isYoungerAgeGroup: false,
      statsMovementDecision: '',
      statsMovementTeam: null,
      requiresStatsMovementDecision: false,
      identityResolution: '',
      identityMatchStatus: '',
      identityStatus: STATS_IDENTITY_STATUS.UNRESOLVED,
      identityMessage: 'בחר סטטוס בסגל',
    })
    expect(result.statsMinutesCorrection).toBeUndefined()
  })

  test('regular stats-cell edit preserves other row fields and removes correction', () => {
    const result = applyStatsCellEdit({
      row: rowWithCorrection({ goals: 1, untouched: 'נשמר' }),
      columnKey: 'goals',
      value: 2,
    })

    expect(result).toMatchObject({ fullName: 'שחקן בדיקה', goals: 2, untouched: 'נשמר' })
    expect(result.statsMinutesCorrection).toBeUndefined()
  })

  test('dispatcher routes every special column and generic cells to the established transformation', () => {
    const rosterMatchRow = rowWithCorrection()
    const candidateRow = rowWithCorrection({
      identityCandidates: [{ candidateKey: 'candidate-1', playerId: 'player-1', playerDocumentId: 'doc-1' }],
    })

    expect(updateStatsImportRow({
      row: rosterMatchRow,
      columnKey: 'fullNameRosterMatch',
      value: '__createNew',
      players: [],
    })).toEqual(applyRosterMatchEdit({ row: rosterMatchRow, value: '__createNew', players: [] }))
    expect(updateStatsImportRow({
      row: rosterMatchRow,
      columnKey: 'statsMovementDecision',
      value: { decision: 'youngerAgeGroup' },
      players: [],
    })).toEqual(applyMovementDecision({
      row: rosterMatchRow,
      value: { decision: 'youngerAgeGroup' },
    }))
    expect(updateStatsImportRow({
      row: candidateRow,
      columnKey: 'systemCandidateApproval',
      value: 'candidate-1',
      players: [],
    })).toEqual(applySystemCandidateApproval({ row: candidateRow, value: 'candidate-1' }))
    expect(updateStatsImportRow({
      row: rosterMatchRow,
      columnKey: 'rosterStatus',
      value: 'regular',
      players: [],
    })).toEqual(applyRosterStatusEdit({ row: rosterMatchRow, value: 'regular' }))
    expect(updateStatsImportRow({
      row: rosterMatchRow,
      columnKey: 'goals',
      value: 4,
      players: [],
    })).toEqual(applyStatsCellEdit({ row: rosterMatchRow, columnKey: 'goals', value: 4 }))
  })

  test('dispatcher preserves no-op identity for invalid actions', () => {
    const movementRow = rowWithCorrection()
    const candidateRow = rowWithCorrection({ identityCandidates: [] })

    expect(updateStatsImportRow({
      row: movementRow,
      columnKey: 'statsMovementDecision',
      value: { decision: 'joined', team: null },
      players: [],
    })).toBe(movementRow)
    expect(updateStatsImportRow({
      row: candidateRow,
      columnKey: 'systemCandidateApproval',
      value: 'missing',
      players: [],
    })).toBe(candidateRow)
  })
})
