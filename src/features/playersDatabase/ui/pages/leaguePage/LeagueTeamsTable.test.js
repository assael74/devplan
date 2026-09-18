import { buildLeagueTableExportConfig } from './LeagueTeamsTable.js'

test('builds League Excel name with league, region, age group, birth year and season', () => {
  const config = buildLeagueTableExportConfig({
    leagueName: 'ליגת נערים',
    region: 'מרכז',
    ageGroup: 'נערים ב׳',
    birthYear: 2010,
    selectedSeasonOption: { seasonKey: '26-27' },
    rowsCount: 1,
  })

  expect(config.fileName).toBe('ליגת נערים - מרכז - נערים ב׳ - 2010 - 26-27')
  expect(config.columns.map(column => column.label)).toContain('קישור קבוצה')
  expect(config.columns.map(column => column.label)).not.toContain('קישור מועדון')
  expect(config.columns.map(column => column.key)).not.toContain('teamPageLink')
})
