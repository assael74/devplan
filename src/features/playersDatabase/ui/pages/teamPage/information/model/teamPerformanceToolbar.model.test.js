// src/features/playersDatabase/ui/pages/teamPage/information/model/teamPerformanceToolbar.model.test.js

import { buildTeamPerformanceToolbar } from './teamPerformanceToolbar.model.js'

test.each([
  [1, 3, 'sortUp', 'success', '+2'],
  [3, 1, 'sortDown', 'danger', '-2'],
  [1, 1, 'equal', 'neutral', ''],
  [1, 1.5, 'sortUp', 'success', '+0.5'],
])('competition level %s versus %s uses sporting direction', (currentLevel, previousLevel, iconId, color, amount) => {
  const competition = buildTeamPerformanceToolbar({
    performanceInsight: { facts: { currentLevel, previousLevel } },
  }).kpis.find(item => item.key === 'competition')
  expect(competition.value).toBe(currentLevel)
  expect(competition.color).toBe(color)
  expect(competition.change.iconId).toBe(iconId)
  expect(competition.change.color).toBe(color)
  expect(competition.change.label).toContain(amount)
  if (currentLevel === previousLevel) expect(competition.change.label).toBe('')
})

test.each([
  [1, null, undefined],
  [undefined, 1, undefined],
  [1, 2, 'upcoming'],
])('competition change is hidden for missing levels or upcoming seasons', (currentLevel, previousLevel, status) => {
  const competition = buildTeamPerformanceToolbar({
    performanceInsight: { facts: { currentLevel, previousLevel } },
    seasonTimeline: [{ status }],
  }).kpis.find(item => item.key === 'competition')
  expect(competition.change).toBeNull()
  expect(competition.color).toBe('neutral')
})

test.each([
  [9, 'sortUp', 'success', '+9'],
  [-3, 'sortDown', 'danger', '-3'],
  [0, 'equal', 'neutral', '0'],
])('rank change follows the comparable season insight: %s', (rankDelta, iconId, color, amount) => {
  const rank = buildTeamPerformanceToolbar({
    performanceInsight: { facts: { rankDelta } },
    seasonTimeline: [{ tableRank: 1 }],
  }).kpis.find(item => item.key === 'rank')
  expect(rank.value).toBe(1)
  expect(rank.color).toBe(color)
  expect(rank.change.iconId).toBe(iconId)
  expect(rank.change.color).toBe(color)
  expect(rank.change.label).toContain(amount)
})

test('does not show a rank change without a comparable insight or in an upcoming season', () => {
  ;[null, undefined].forEach(rankDelta => {
    const rank = buildTeamPerformanceToolbar({
      performanceInsight: { facts: { rankDelta } },
      seasonTimeline: [{ tableRank: 1 }],
    }).kpis.find(item => item.key === 'rank')
    expect(rank.change).toBeNull()
  })
  const rank = buildTeamPerformanceToolbar({
    performanceInsight: { facts: { rankDelta: 9 } },
    seasonTimeline: [{ status: 'upcoming' }],
  }).kpis.find(item => item.key === 'rank')
  expect(rank.change).toBeNull()
})

test('summarizes the displayed season and shares table change directions', () => {
  const summary = buildTeamPerformanceToolbar({
    selectedSeasonKey: '26/27',
    performanceInsight: {
      facts: { currentLevel: 1, profiles: { professional: { significant: true }, underuse: { significant: true } } },
      details: [{ key: 'professionalProfiles', tone: 'positive' }, { key: 'underuseProfiles', tone: 'positive' }],
    },
    seasonTimeline: [{ seasonKey: '26/27', tableRank: 2 }],
    offensePriorityTimeline: [{ score: 65.2 }],
    defensePriorityTimeline: [{ score: 71.9 }],
    developmentTimeline: [
      { seasonKey: '27/28', status: 'upcoming' },
      { seasonKey: '26/27', successPercent: 80, professionalProfiles: 9, underuseProfiles: 2 },
      { seasonKey: '25/26', successPercent: 60, professionalProfiles: 6, underuseProfiles: 4 },
    ],
  })
  expect(summary.seasonKey).toBe('26/27')
  expect(summary.kpis.map(item => item.value)).toEqual([1, 2, '65', '72'])
  expect(summary.metrics.map(item => item.value)).toEqual(['80%', '9', '2'])
  expect(summary.metrics.map(item => item.change.direction)).toEqual(['up', 'up', 'down'])
  expect(summary.metrics.every(item => item.change.color === 'success')).toBe(true)
})

test('keeps zero, missing values and missing comparisons distinct', () => {
  expect(buildTeamPerformanceToolbar().metrics.every(item => item.value === '—' && item.change === null)).toBe(true)
  const summary = buildTeamPerformanceToolbar({
    selectedSeasonKey: '26/27',
    performanceInsight: {
      facts: { profiles: { underuse: { significant: true } } },
      details: [{ key: 'underuseProfiles', tone: 'negative' }],
    },
    developmentTimeline: [
      { seasonKey: '26/27', professionalProfiles: 0, underuseProfiles: 5 },
      { seasonKey: '25/26', professionalProfiles: 0, underuseProfiles: 2 },
    ],
  })
  expect(summary.metrics[0].change).toBeNull()
  expect(summary.metrics[1].value).toBe('0')
  expect(summary.metrics[1].change.direction).toBe('same')
  expect(summary.metrics[2].change.color).toBe('danger')
})

test.each([
  [false, 'positive', 'neutral'],
  [true, 'positive', 'success'],
  [true, 'negative', 'danger'],
  [true, 'neutral', 'neutral'],
])('profile chips use the insight tone only when significant: %s %s', (significant, tone, color) => {
  const summary = buildTeamPerformanceToolbar({
    performanceInsight: {
      facts: { profiles: { professional: { significant }, underuse: { significant } } },
      details: [{ key: 'professionalProfiles', tone }, { key: 'underuseProfiles', tone }],
    },
    developmentTimeline: [
      { seasonKey: '26/27', professionalProfiles: 9, underuseProfiles: 5 },
      { seasonKey: '25/26', professionalProfiles: 8, underuseProfiles: 8 },
    ],
  })
  summary.metrics.slice(1).forEach(item => {
    expect(item.color).toBe(color)
    expect(item.change.color).toBe(color)
  })
  expect(summary.metrics[2].change.direction).toBe('down')
})
