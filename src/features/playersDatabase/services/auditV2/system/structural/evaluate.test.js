// src/features/playersDatabase/services/auditV2/system/structural/evaluate.test.js

import { evaluateStructuralIntegrityV2 } from './evaluate.js'

const cleanState = () => ({
  leagues: [{
    id: 'league-1',
    data: {
      leagueId: 'league-1',
      current: {
        seasonKey: '26_27',
        seasonStatus: 'active',
        tableRank: [{ teamId: 'team-1', clubId: 'club-1' }],
      },
      history: [],
    },
  }],
  teamRoots: [{
    id: 'team-1',
    data: {
      clubId: 'club-1',
      seasons: [{ seasonKey: '26_27', seasonDocumentId: 'team-1__26_27' }],
    },
  }],
  teamSeasons: [{
    id: 'team-1__26_27',
    data: {
      birthTeamDocumentId: 'team-1',
      seasonKey: '26_27',
      leagueId: 'league-1',
      teamPlayers: [],
      pendingPlayers: [],
      transfersIn: [],
      transfersOut: [],
    },
  }],
  clubs: [{
    id: 'club-1',
    data: {
      clubId: 'club-1',
      ageGroups: [{
        ageGroupId: 'u15',
        seasons: [{
          teamId: 'team-1',
          seasonKey: '26_27',
          league: { leagueId: 'league-1' },
        }],
      }],
    },
  }],
})

describe('evaluateStructuralIntegrityV2', () => {
  test('returns no findings for coherent canonical relations', () => {
    expect(evaluateStructuralIntegrityV2(cleanState())).toEqual([])
  })

  test('detects completed current season and duplicated current/history season', () => {
    const state = cleanState()
    state.leagues[0].data.current.seasonStatus = 'completed'
    state.leagues[0].data.history = [{
      seasonKey: '26_27',
      seasonStatus: 'completed',
      tableRank: [{ teamId: 'team-1', clubId: 'club-1' }],
    }]

    const findings = evaluateStructuralIntegrityV2(state)

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'invalid_lifecycle',
        title: 'עונה שהסתיימה נמצאת ב-current של הליגה',
      }),
      expect.objectContaining({
        type: 'invalid_lifecycle',
        title: 'אותה עונת ליגה קיימת גם ב-current וגם ב-history',
      }),
    ]))
  })

  test('detects Team Season without Team Root', () => {
    const state = cleanState()
    state.teamRoots = []

    const findings = evaluateStructuralIntegrityV2(state)

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'broken_relation',
        target: 'teamSeasons',
        documentId: 'team-1__26_27',
        title: 'Team Season ללא Team Root',
      }),
    ]))
  })

  test('detects Team Root without season reference', () => {
    const state = cleanState()
    state.teamRoots[0].data.seasons = []

    expect(evaluateStructuralIntegrityV2(state)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'broken_relation',
        target: 'teamRoots',
        title: 'Team Root אינו מפנה ל-Team Season',
      }),
    ]))
  })

  test('detects Team Season not present in canonical League table', () => {
    const state = cleanState()
    state.leagues[0].data.current.tableRank = [{ teamId: 'team-other' }]

    expect(evaluateStructuralIntegrityV2(state)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'broken_relation',
        target: 'teamSeasons',
        title: 'Team Season אינו מחובר לשורת קבוצה בטבלת הליגה',
      }),
    ]))
  })

  test('detects Team Root pointing to a missing Club projection', () => {
    const state = cleanState()
    state.clubs = []

    expect(evaluateStructuralIntegrityV2(state)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'broken_relation',
        target: 'clubs',
        documentId: 'team-1',
        relatedDocumentId: 'club-1',
      }),
    ]))
  })

  test('detects Club relation that conflicts with Team Root club identity', () => {
    const state = cleanState()
    state.clubs[0].data.clubId = 'club-2'
    state.clubs[0].id = 'club-2'

    expect(evaluateStructuralIntegrityV2(state)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'broken_relation',
        target: 'clubs',
        title: 'Club מכיל קבוצה ששייכת למועדון אחר',
      }),
    ]))
  })


  test('detects Team Root pointing to a missing Team Season document', () => {
    const state = cleanState()
    state.teamRoots[0].data.seasons = [{ seasonKey: '26_27', seasonDocumentId: 'missing-season' }]

    expect(evaluateStructuralIntegrityV2(state)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'broken_relation',
        target: 'teamRoots',
        title: 'Team Root מפנה ל-Team Season שאינו קיים',
      }),
    ]))
  })

  test('detects Team Root pointing to a Team Season with another identity', () => {
    const state = cleanState()
    state.teamRoots[0].data.seasons = [{ seasonKey: '25_26', seasonDocumentId: 'team-1__26_27' }]

    expect(evaluateStructuralIntegrityV2(state)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'broken_relation',
        target: 'teamRoots',
        title: 'Team Root מפנה ל-Team Season בעל זהות אחרת',
      }),
    ]))
  })

  test('detects non-completed and duplicate history seasons', () => {
    const state = cleanState()
    state.leagues[0].data.history = [
      { seasonKey: '25_26', seasonStatus: 'active', tableRank: [] },
      { seasonKey: '25/26', seasonStatus: 'completed', tableRank: [] },
    ]

    const findings = evaluateStructuralIntegrityV2(state)

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: 'עונת history אינה מסומנת completed' }),
      expect.objectContaining({ title: 'אותה עונה מופיעה יותר מפעם אחת ב-history' }),
    ]))
  })


  test('allows League-only Club relation when League row exists but Team Root and Team Season do not', () => {
    const state = cleanState()
    state.teamRoots = []
    state.teamSeasons = []

    expect(evaluateStructuralIntegrityV2(state)).toEqual([])
  })

  test('detects Club relation when Team exists but is missing from the referenced League table', () => {
    const state = cleanState()
    state.leagues[0].data.current.tableRank = [{ teamId: 'team-other', clubId: 'club-1' }]

    expect(evaluateStructuralIntegrityV2(state)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        target: 'clubs',
        title: 'Club אינו מחובר לשורת הקבוצה בעונת הליגה',
      }),
    ]))
  })

  test('detects Club id mismatch against the League table row', () => {
    const state = cleanState()
    state.leagues[0].data.current.tableRank[0].clubId = 'club-other'

    expect(evaluateStructuralIntegrityV2(state)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        target: 'clubs',
        title: 'Club אינו תואם למועדון שבשורת הליגה',
      }),
    ]))
  })

  test('detects a missing Club id on the League table row', () => {
    const state = cleanState()
    delete state.leagues[0].data.current.tableRank[0].clubId

    expect(evaluateStructuralIntegrityV2(state)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        target: 'clubs',
        title: 'Club אינו תואם למועדון שבשורת הליגה',
        expected: { clubId: 'club-1' },
        actual: { clubId: '' },
      }),
    ]))
  })


  test('detects the same team in two leagues in one season', () => {
    const state = cleanState()
    state.leagues.push({
      id: 'league-2',
      data: {
        leagueId: 'league-2',
        current: {
          seasonKey: '26_27',
          seasonStatus: 'active',
          tableRank: [{ teamId: 'team-1', clubId: 'club-1' }],
        },
        history: [],
      },
    })

    expect(evaluateStructuralIntegrityV2(state)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'duplicate_relation',
        target: 'leagues',
        teamId: 'team-1',
        seasonKey: '26/27',
      }),
    ]))
  })
})
