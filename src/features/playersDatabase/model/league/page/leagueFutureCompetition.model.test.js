// src/features/playersDatabase/model/league/page/leagueFutureCompetition.model.test.js

import { describeLeagueFutureCompetition, resolveLeagueFutureCompetitionSource } from './leagueFutureCompetition.model.js'

const seasonId = '2026_2027'
const input = {
  clubId: 'club', teamSlot: 1, birthYear: 2012, seasonId,
  leaguesCenterDocument: { leaguesById: { older: { seasonsById: { [seasonId]: {
    birthYear: 2011, teamsById: { source: { clubId: 'club', teamSlot: 1 } },
  } } } } },
}
const source = resolveLeagueFutureCompetitionSource(input).source
const league = (games = 8, configured = true) => ({
  leagueId: 'older', level: 1, seasonsById: { [seasonId]: {
    birthYear: 2011, seasonStatus: 'active', leagueTotalRound: 38,
    competitionRules: { configured, promotion: {}, relegation: { directPlaces: [18, 19, 20] } },
    table: { teamsById: { source: {
      clubId: 'club', teamSlot: 1, officialTable: { rank: 1, points: 22, teamGamePlayed: games },
    } } },
  } },
})

test('identifies the same club and slot in the previous birth year and the same season', () => {
  expect(source).toEqual({ leagueId: 'older', teamId: 'source', clubId: 'club', teamSlot: 1, seasonId, sourceBirthYear: 2011 })
  expect(resolveLeagueFutureCompetitionSource({ ...input, teamSlot: 2 }).source).toBeUndefined()
  expect(resolveLeagueFutureCompetitionSource({ ...input, clubId: 'other' }).source).toBeUndefined()
  expect(resolveLeagueFutureCompetitionSource({ ...input, seasonId: '2025_2026' }).source).toBeUndefined()
  expect(resolveLeagueFutureCompetitionSource({ ...input, birthYear: 2013 }).source).toBeUndefined()
})

test('ambiguous source registries do not choose an arbitrary league', () => {
  const document = input.leaguesCenterDocument
  const result = resolveLeagueFutureCompetitionSource({
    ...input, leaguesCenterDocument: { leaguesById: { ...document.leaguesById, duplicate: document.leaguesById.older } },
  })
  expect(result.source).toBeUndefined()
  expect(result.description).toContain('חד־משמעי')
})

test('reports the precise source birth year and halfway blocker using canonical competition rules', () => {
  expect(describeLeagueFutureCompetition(source, league())).toBe('שנתון 2011: טרם הושלמו 50% ממשחקי העונה')
  expect(describeLeagueFutureCompetition(source, league(18))).toContain('50%')
  expect(describeLeagueFutureCompetition(source, league(19))).toContain('סיכום צפי התחרות בטבלת הליגה טרם עודכן')
  const both = describeLeagueFutureCompetition(source, league(8, false))
  expect(both).toContain('לא הוגדרו חוקי עלייה וירידה')
  expect(both).toContain('50%')
  expect(describeLeagueFutureCompetition(source, league(19, false))).not.toContain('50%')
})

test('missing canonical data is reported without inventing a halfway reason', () => {
  expect(describeLeagueFutureCompetition(source, null)).toContain('נתוני ליגת המקור לא זמינים')
  expect(describeLeagueFutureCompetition(source, { seasonsById: {} })).toContain('חסרים נתוני העונה')
  const changed = league()
  changed.seasonsById[seasonId].table.teamsById.source.clubId = 'other'
  expect(describeLeagueFutureCompetition(source, changed)).toContain('קבוצת המקור חסרה')
  expect(describeLeagueFutureCompetition(source, changed)).not.toContain('50%')
})
