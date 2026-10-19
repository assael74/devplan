// src/features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenter.export.test.js

import { buildLeagueCenterExportConfig } from './leagueCenter.export.js'
import { countTeamSignalFamilies, buildTeamSignalSummary } from '../../../../domain/signals/teamSignalSummary.js'

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
    signalFamiliesById: countTeamSignalFamilies([buildTeamSignalSummary({ familiesById: {
      'roster-balance': { level: 2, availability: 'available' },
    } })]),
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
  expect(valueOf('roster-balance-count')).toBe(1)
  expect(valueOf('roster-balance-level')).toBe(2)
  expect(valueOf('roster-balance-availability')).toBe('מלא')
  expect(valueOf('performance-count')).toBe('לא ידוע')
  expect(valueOf('performance-level')).toBe('לא ידוע')
  expect(config.columns.some(column => ['offensePriorityCoverage', 'defensePriorityCoverage'].includes(column.key))).toBe(false)
})
