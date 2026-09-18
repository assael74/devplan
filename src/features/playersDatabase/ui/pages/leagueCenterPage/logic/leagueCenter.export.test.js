import { buildLeagueCenterExportConfig } from './leagueCenter.export.js'

test('exports all supplied league rows with their existing summary metrics', () => {
  const rows = [{
    leagueName: 'ליגת נערים',
    region: 'מרכז',
    ageGroupLabel: 'נערים ב׳',
    birthYear: 2010,
    seasonKey: '26-27',
    teamsCount: 12,
    playersStatsCompleteCount: 10,
    playersStatsTargetCount: 12,
    offensePriorityCount: 3,
    offensePriorityTargetCount: 12,
    defensePriorityCount: 2,
    defensePriorityTargetCount: 12,
    playersCount: 245,
    playersWithProfiles: 18,
    scoutProfilesCount: 21,
    tableStatus: 'full',
  }]
  const config = buildLeagueCenterExportConfig({ rows })
  const valueOf = key => config.columns.find(column => column.key === key).value(rows[0])

  expect(config).toMatchObject({
    enabled: true,
    fileName: 'מרכז-ליגות-כל-הליגות',
  })
  expect(config.getRows()).toBe(rows)
  expect(valueOf('playersStatsCoverage')).toBe('10 / 12')
  expect(valueOf('playersCount')).toBe(245)
  expect(valueOf('tableStatus')).toBe('מלאה')
})
