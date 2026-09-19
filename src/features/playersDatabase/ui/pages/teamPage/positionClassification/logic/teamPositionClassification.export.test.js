import {
  buildTeamPositionClassificationFileName,
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
