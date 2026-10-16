// src/features/playersDatabase/ui/pages/teamPage/information/model/teamClubComparison.presentation.test.js

import { clubMetricTone } from './teamClubComparison.presentation.js'

test.each([
  ['successRate', 20, 'success'], ['successRate', -20, 'danger'],
  ['professionalRate', 20, 'success'], ['professionalRate', -20, 'danger'],
  ['underuseRate', -20, 'success'], ['underuseRate', 20, 'danger'],
  ['leagueLevel', -1, 'success'], ['leagueLevel', 1, 'danger'],
  ['offense', 2, 'success'], ['defense', -2, 'danger'],
])('colors %s by its meaning rather than only the direction', (key, delta, expected) => {
  expect(clubMetricTone({ key, delta, availability: 'available', isAnomaly: true })).toBe(expected)
})

test('keeps small differences, missing comparisons and equality neutral', () => {
  expect(clubMetricTone({ key: 'successRate', delta: 5, availability: 'available', isAnomaly: false })).toBe('neutral')
  expect(clubMetricTone({ key: 'underuseRate', delta: -20, availability: 'unavailable', isAnomaly: false })).toBe('neutral')
  expect(clubMetricTone({ key: 'offense', delta: 0, availability: 'available', isAnomaly: false })).toBe('neutral')
})
