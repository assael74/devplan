// src/features/playersDatabase/ui/pages/teamPage/stats/import/logic/statsIdentityDetails.test.js
import { prepareStatsIdentityEdit, validateStatsIdentityDetails } from './statsIdentityDetails.js'

const details = { externalPlayerId: '12345', playerUrl: '/players/player/?player_id=12345' }
test('normalizes a matching association URL and rejects mismatched or invalid identity', () => {
  expect(validateStatsIdentityDetails(details).playerUrl).toBe('https://www.football.org.il/players/player/?player_id=12345')
  expect(() => validateStatsIdentityDetails({ ...details, externalPlayerId: '54321' })).toThrow('אינו תואם')
  expect(() => validateStatsIdentityDetails({ ...details, externalPlayerId: '12' })).toThrow('מזהה')
  expect(() => validateStatsIdentityDetails({ ...details, playerUrl: 'javascript:alert(1)' })).toThrow('קישור')
})
test('clears old identity approvals but preserves statistics and movement decisions', () => {
  const row = { playerId: 'old', approvedCanonicalPlayerId: 'old', minutes: 100, rosterStatus: 'youngerAgeGroup', isYoungerAgeGroup: true }
  const edited = prepareStatsIdentityEdit({ row, details })
  expect(edited).toMatchObject({ playerId: '', approvedCanonicalPlayerId: '', externalPlayerId: '12345', minutes: 100, rosterStatus: 'youngerAgeGroup', isYoungerAgeGroup: true })
  expect(row.playerId).toBe('old')
})
