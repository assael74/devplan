// src/features/playersDatabase/ui/pages/teamPage/positionClassification/logic/teamPositionClassification.export.test.js

import {
  buildTeamPositionClassificationFileName,
  buildTeamPositionClassificationExportRows,
  TEAM_POSITION_CLASSIFICATION_EXPORT_COLUMNS,
} from './teamPositionClassification.export.js'

const exportValue = ({ header, row = {}, index = 0 }) => {
  const column = TEAM_POSITION_CLASSIFICATION_EXPORT_COLUMNS
    .find(([label]) => label === header)
  return column?.[1](row, index)
}

test('keeps external player id in column C and appends QA-only transfer fields', () => {
  const headers = TEAM_POSITION_CLASSIFICATION_EXPORT_COLUMNS.map(([label]) => label)
  const row = {
    player: {
      externalPlayerId: '123456',
      playerId: 'player-internal-1',
      transferCheck: 'legacy-check-only',
    },
  }

  expect(headers.slice(0, 4)).toEqual([
    'אינדקס',
    'שם שחקן',
    'מזהה שחקן חיצוני',
    'קישור שחקן',
  ])
  expect(headers.slice(-2)).toEqual(['בקרת העברה', 'מזהה שחקן פנימי'])
  expect(exportValue({ header: 'מזהה שחקן חיצוני', row })).toBe('123456')
  expect(exportValue({ header: 'בקרת העברה', row })).toBe('legacy-check-only')
  expect(exportValue({ header: 'מזהה שחקן פנימי', row })).toBe('player-internal-1')
})

test('includes team birth year and age group in the Excel file name', () => {
  expect(buildTeamPositionClassificationFileName({
    teamName: 'הפועל דוגמה',
    birthYear: 2010,
    ageGroupLabel: 'נערים ב׳',
    seasonKey: '26-27',
  })).toBe('סיווג-עמדה-הפועל-דוגמה-שנתון-2010-נערים-ב׳-26-27')
})

test('adds transfer team names and keeps explicit roster statuses', () => {
  const rows = buildTeamPositionClassificationExportRows({
    rows: [
      { id: 'joined-player', name: 'מצטרף', rosterStatus: 'regular' },
      { id: 'young-player', name: 'צעיר', rosterStatus: 'youngerAgeGroup' },
      { id: 'unknown-player', name: 'לא מסווג', rosterStatus: '' },
    ],
    seasonDoc: {
      transfersIn: [{
        playerId: 'joined-player',
        fromClubId: 'maccabi-haifa',
        fromBirthTeamSlot: 2,
      }],
      transfersOut: [{
        playerId: 'unknown-player',
        toClubId: 'hapoel-tel-aviv',
        toBirthTeamSlot: 1,
      }],
      resolvedRosterAbsences: [{
        playerId: 'older-player',
        externalPlayerId: '998877',
        fullName: 'חריג גיל',
        resolution: 'olderAgeException',
      }],
    },
    teamName: 'קבוצה נוכחית',
  })

  const joined = rows.find(row => row.id === 'joined-player')
  const unknown = rows.find(row => row.id === 'unknown-player')
  const older = rows.find(row => row.id === 'older-player')

  expect(joined.transferFromTeamName).toContain('קבוצה 2')
  expect(unknown.transferToTeamName).toBeTruthy()
  expect(exportValue({ header: 'סטטוס סגל', row: joined })).toBe('בסגל')
  expect(exportValue({ header: 'סטטוס סגל', row: rows[1] })).toBe('שנתון צעיר')
  expect(exportValue({ header: 'סטטוס סגל', row: unknown })).toBe('לא ידוע')
  expect(exportValue({ header: 'סטטוס סגל', row: older })).toBe('חריג גיל')
  expect(exportValue({ header: 'קבוצה ממנה עבר', row: joined }))
    .toBe(joined.transferFromTeamName)
  expect(exportValue({ header: 'קבוצה אליה עבר', row: unknown }))
    .toBe(unknown.transferToTeamName)
})
