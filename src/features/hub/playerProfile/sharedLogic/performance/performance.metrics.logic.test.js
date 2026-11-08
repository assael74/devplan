// src/features/hub/playerProfile/sharedLogic/performance/performance.metrics.logic.test.js

import {
  aggregatePerformanceMetric,
  buildPerformanceReport,
  formatPerformanceValue,
  PERFORMANCE_METRICS,
} from './performance.metrics.logic.js'
import { buildPositionComparison, getBenchmarkGapTone, getPlayerStandardPosition, POSITION_STANDARD } from './performance.comparison.logic.js'
import { buildPerformanceShareReport, buildPerformanceShareText, filterPerformanceShareReport, performanceShareText } from './performance.share.logic.js'
import { hydratePlayerPerformanceGames } from './performance.domain.logic.js'
import { resolveEntityAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'

jest.mock('../../../../../shared/performance/filters/statsFilterGroups.js', () => ({ statsFilterGroups: [] }))

const passes = PERFORMANCE_METRICS.find(metric => metric.id === 'passes')
const fixtureGame = (id, stats, overrides = {}) => ({
  id, gameDate: `2026-10-${id === 'g1' ? '28' : '31'}`, rivel: id === 'g1' ? 'בני סכנין' : 'מכבי תא',
  type: id === 'g1' ? 'cup' : 'league', gameDuration: 90,
  playerStats: [{ playerId: 'p1', timePlayed: 90, ...stats }],
  ...overrides,
})
const playerWith = games => ({ id: 'p1', playerFullName: 'שי רוזן', primaryPosition: 'DCR', playerGames: games })

test('sharing includes the player photo and the canonical default avatar', () => {
  const player = { ...playerWith([]), photo: 'https://example.com/player.jpg' }
  const report = buildPerformanceReport({ player })
  const shared = buildPerformanceShareReport({ player, report, view: 'summary' })
  const fallback = resolveEntityAvatar({ entityType: 'player' })
  expect(shared.playerAvatar).toEqual({ name: 'שי רוזן', src: player.photo, fallback })
  const withoutPhoto = buildPerformanceShareReport({ player: { ...player, photo: '' }, report, view: 'summary' })
  expect(withoutPhoto.playerAvatar.src).toBe(fallback)
  expect(filterPerformanceShareReport(shared, [], ['מדד']).playerAvatar).toEqual(shared.playerAvatar)
})

test.each(['regular', 'project', 'private'])('%s: reads measured values from each game', kind => {
  const games = [fixtureGame('g1', { passesTotal: 34, passesSuccess: 29, timeVideoStats: 60 })]
  const player = { ...playerWith(games), type: kind, isPrivatePlayer: kind === 'private' }
  if (kind === 'private') {
    player.externalGames = games
    delete player.playerGames
  }
  const report = buildPerformanceReport({ player, target: '90' })
  expect(report.games[0]).toMatchObject({ measured: true, timePlayed: 90, videoMinutes: 60 })
  expect(report.rawMetrics.find(metric => metric.id === 'passes')).toMatchObject({ value: 34, success: 29, rate: 85 })
  expect(report.normalizedMetrics.find(metric => metric.id === 'passes')).toMatchObject({ average: 51, successAverage: 43.5, rate: 85 })
})

test('normalized per-game mean matches the original workbook without using player minutes as denominator', () => {
  const games = [
    fixtureGame('g1', { passesTotal: 13, passesSuccess: 10, timeVideoStats: 65 }),
    fixtureGame('g2', { passesTotal: 34, passesSuccess: 29, timeVideoStats: 65 }),
    fixtureGame('g3', { passesTotal: 14, passesSuccess: 7, timeVideoStats: 60 }),
  ]
  const report = buildPerformanceReport({ player: playerWith(games), target: '90' })
  const raw = report.rawMetrics.find(metric => metric.id === 'passes')
  const normalized = report.normalizedMetrics.find(metric => metric.id === 'passes')
  expect(raw).toMatchObject({ value: 61, success: 46, rate: 75, count: 3 })
  expect(normalized.average).toBeCloseTo(28.692307692307693)
  expect(normalized.successAverage).toBeCloseTo(21.5)
  expect(normalized.rate).toBe(75)
})

test('age-group, 80-minute and 90-minute bases are distinct for mixed durations', () => {
  const player = playerWith([
    fixtureGame('g1', { passesTotal: 30, timeVideoStats: 60 }, { gameDuration: 80 }),
    fixtureGame('g2', { passesTotal: 15, timeVideoStats: 30 }, { gameDuration: 90 }),
  ])
  const average = target => buildPerformanceReport({ player, target }).normalizedMetrics.find(metric => metric.id === 'passes').average
  expect(average('age')).toBe(42.5)
  expect(average('80')).toBe(40)
  expect(average('90')).toBe(45)
})

test('missing measurements are excluded while explicit zero stays measured', () => {
  const report = buildPerformanceReport({ player: playerWith([
    fixtureGame('g1', { ballLoss: 0, timeVideoStats: 60 }),
    fixtureGame('g2', { passesTotal: 2, passesSuccess: 1, timeVideoStats: 60 }),
    fixtureGame('g3', { ballLoss: 2, timeVideoStats: 60 }),
  ]) })
  expect(report.rawMetrics.find(metric => metric.id === 'ballLoss')).toMatchObject({ value: 2, average: 1, count: 2, totalGames: 3 })
  expect(report.rawMetrics.find(metric => metric.id === 'shots').value).toBeNull()
})

test('missing video or duration cannot create a normalized zero or a division error', () => {
  const player = playerWith([
    fixtureGame('g1', { passesTotal: 4, passesSuccess: 0, timeVideoStats: 0 }),
    fixtureGame('g2', { passesTotal: 0, passesSuccess: 0, timeVideoStats: 30 }, { gameDuration: undefined }),
  ])
  const report = buildPerformanceReport({ player })
  expect(report).toMatchObject({ normalizedGames: 0, missingVideoGames: 1, missingDurationGames: 1 })
  expect(report.normalizedMetrics.find(metric => metric.id === 'passes')).toMatchObject({ value: null, rate: null, count: 0 })
  const fixed = buildPerformanceReport({ player, target: '80' })
  expect(fixed.normalizedMetrics.find(metric => metric.id === 'passes')).toMatchObject({ average: 0, rate: null, count: 1 })
})

test('success percentage uses only pairs measured in the same game', () => {
  const report = buildPerformanceReport({ player: playerWith([
    fixtureGame('g1', { passesTotal: 10, passesSuccess: 8, timeVideoStats: 60 }),
    fixtureGame('g2', { passesTotal: 90, timeVideoStats: 60 }),
  ]) })
  expect(report.rawMetrics.find(metric => metric.id === 'passes')).toMatchObject({ value: 100, success: 8, rate: 80, pairedCount: 1 })
})

test('date and cup filters apply before aggregation and WhatsApp export', () => {
  const player = playerWith([
    fixtureGame('g1', { passesTotal: 34, passesSuccess: 29, timeVideoStats: 60 }, { gameDate: '28/10/2026' }),
    fixtureGame('g2', { passesTotal: 1000, timeVideoStats: 90 }),
  ])
  const report = buildPerformanceReport({ player, filters: { type: 'cup', from: '2026-10-28', to: '2026-10-28' } })
  expect(report.games.map(game => game.id)).toEqual(['g1'])
  const message = buildPerformanceShareText({ player, report, view: 'games', activeGame: report.games[0] })
  expect(message).toContain('בני סכנין')
  expect(message).toContain('34 סה״כ')
  expect(message).toContain('85%')
  expect(message).not.toContain('1000')
  expect(message).not.toContain('playerId')
})

test('position comparison scales counts from 90 to 80 and leaves percentages unchanged', () => {
  const report = buildPerformanceReport({ player: playerWith([
    fixtureGame('g1', { passesTotal: 30, passesSuccess: 27, ballLoss: 1, timeVideoStats: 60 }),
  ]) })
  const compare = minutes => buildPositionComparison({ games: report.measuredGames, positionId: 'CD', minutes })
  const at90 = compare(90)
  const at80 = compare(80)
  const count90 = at90.find(metric => metric.id === 'passesTotal')
  const count80 = at80.find(metric => metric.id === 'passesTotal')
  expect(count90.actual).toBe(45)
  expect(count80.actual).toBe(40)
  expect(count80.target).toBeCloseTo(count90.target * 80 / 90)
  expect(at90.find(metric => metric.id === 'passesSuccessRate').target).toBe(87)
  expect(at80.find(metric => metric.id === 'passesSuccessRate').target).toBe(87)
  expect(at80.find(metric => metric.id === 'ballLoss').favorable).toBe(true)
})

test('unsupported metrics and positions are explicit instead of mapped to another measurement', () => {
  expect(POSITION_STANDARD.positions).toHaveLength(8)
  expect(POSITION_STANDARD.positions.reduce((sum, position) => sum + position.metrics.length, 0)).toBe(48)
  expect(getPlayerStandardPosition({ primaryPosition: 'DCR' })).toBe('CD')
  expect(getPlayerStandardPosition({ primaryPosition: 'GK' })).toBe('')
  expect(getPlayerStandardPosition({ primaryPosition: 'AC' })).toBe('')
  const rows = buildPositionComparison({ games: [], positionId: 'CM' })
  expect(rows.find(metric => metric.label === 'יצירת מצבים')).toMatchObject({ actual: null, unavailableReason: 'לא נמדד בטופס הסטטיסטיקה' })
  expect(buildPositionComparison({ games: [], positionId: 'GK' })).toEqual([])
})

test('empty aggregate remains missing', () => {
  expect(aggregatePerformanceMetric([], passes, '90')).toMatchObject({ value: null, average: null, success: null, rate: null, count: 0 })
})

test('a linked document without source game details remains read-only after hydration', () => {
  const player = { id: 'p1', advancedStats: { statsGameRefs: [{ gameId: 'orphan', gameStatsDocId: 's1' }] } }
  const hydrated = {
    ...player,
    playerGames: hydratePlayerPerformanceGames(player, [{
      id: 's1', gameId: 'orphan', playerStats: [{ playerId: 'p1', passesTotal: 4, timeVideoStats: 40 }],
    }]),
  }
  const report = buildPerformanceReport({ player: hydrated })
  expect(report.games[0]).toMatchObject({ measured: true, canEdit: false, duration: null })
  expect(report.missingDurationGames).toBe(1)
})

test('copying a normalized individual game uses that game instead of the aggregate', () => {
  const player = playerWith([
    fixtureGame('g1', { passesTotal: 30, passesSuccess: 24, timeVideoStats: 60 }),
    fixtureGame('g2', { passesTotal: 1000, timeVideoStats: 60 }),
  ])
  const report = buildPerformanceReport({ player, target: '80' })
  const game = report.games.find(item => item.id === 'g1')
  const message = buildPerformanceShareText({ player, report, view: 'normalized', target: '80', normalizedGame: game })
  expect(message).toContain('נרמול ל־80 דקות')
  expect(message).toContain('בני סכנין')
  expect(message).toContain('40 סה״כ')
  expect(message).not.toContain('מכבי תא')
})

test('table and text share the same normalized game, whole percentages and explicit zeros', () => {
  const player = playerWith([
    fixtureGame('g1', { passesTotal: 14, passesSuccess: 12, ballLoss: 0, timeVideoStats: 60 }, { gameDuration: 80 }),
    fixtureGame('g2', { passesTotal: 1000, timeVideoStats: 60 }),
  ])
  const report = buildPerformanceReport({ player, target: 'age' })
  const shared = buildPerformanceShareReport({ player, report, view: 'normalized', target: 'age', normalizedGame: report.games.find(game => game.id === 'g1') })
  expect(shared.rows.find(row => row.id === 'passes').values).toEqual(['19', '16', '86%', '42', '87%'])
  expect(shared.rows.find(row => row.id === 'ballLoss').values).toEqual(['0', '—', '—', '2.9', '—'])
  expect(shared.rows.find(row => row.id === 'shots')).toBeUndefined()
  expect(performanceShareText(shared)).toContain('19 סה״כ')
  expect(JSON.stringify(shared)).not.toContain('1000')
  expect(shared.heading).toContain('בני סכנין')
})

test('summary table retains measurement and paired-rate coverage', () => {
  const player = playerWith([
    fixtureGame('g1', { passesTotal: 10, passesSuccess: 8, ballLoss: 0, timeVideoStats: 60 }),
    fixtureGame('g2', { passesTotal: 90, timeVideoStats: 60 }),
  ])
  const report = buildPerformanceReport({ player })
  const shared = buildPerformanceShareReport({ player, report, view: 'summary' })
  expect(shared.rows.find(row => row.id === 'passes')).toMatchObject({ values: ['100', '8', '80%'], note: '(אחוזי הצלחה מ־1 משחקים)' })
  expect(shared.rows.find(row => row.id === 'ballLoss').note).toBe('(נמדד ב־1 משחקים)')
})

test('position table exports visible comparison units and the lower-is-better rule', () => {
  const player = playerWith([fixtureGame('g1', { passesTotal: 30, passesSuccess: 27, ballLoss: 1, timeVideoStats: 60 })])
  const report = buildPerformanceReport({ player, target: '80' })
  const comparison = buildPositionComparison({ games: report.measuredGames, positionId: 'CD', minutes: 80 })
  const shared = buildPerformanceShareReport({ player, report, comparison, view: 'compare', target: '80', positionLabel: 'בלם' })
  expect(shared.columns).toEqual(['מדד', 'השחקן', 'תקן', 'עדיפות'])
  expect(shared.rows.find(row => row.id === 'passesTotal').values[0]).toBe('40')
  expect(shared.rows.find(row => row.id === 'passesSuccessRate').values.slice(0, 2)).toEqual(['90%', '87%'])
  expect(shared.rows.find(row => row.id === 'ballLoss').values[2]).toBe('נמוך יותר')
  expect(shared.notes).toEqual([])
})

test('only normalized shares add a position benchmark column and scale counts to 80 or 90', () => {
  const player = playerWith([fixtureGame('g1', { passesTotal: 30, passesSuccess: 24, progressivePassesTotal: 4, timeVideoStats: 60 })])
  const share = (view, target) => {
    const report = buildPerformanceReport({ player, target })
    return buildPerformanceShareReport({ player, report, view, target, activeGame: report.games[0] })
  }
  for (const view of ['games', 'summary']) {
    expect(share(view, '80').columns).toEqual(['מדד', 'סה״כ', 'הצלחות', 'אחוז הצלחה'])
  }
  const at80 = share('normalized', '80')
  const at90 = share('normalized', '90')
  expect(at80.columns).toEqual(['מדד', 'סה״כ', 'הצלחות', 'אחוז הצלחה', 'תקן — כמות', 'תקן — אחוז הצלחה'])
  expect(at80.rows.find(row => row.id === 'passes').values.slice(3)).toEqual(['42', '87%'])
  expect(at90.rows.find(row => row.id === 'passes').values.slice(3)).toEqual(['47', '87%'])
  expect(at80.rows.find(row => row.id === 'progressivePasses').values.slice(3)).toEqual(['—', '—'])
  expect(performanceShareText(at80)).toContain('תקן: סה״כ 42 · הצלחה 87%')
  expect(at80.details.join(' ')).toContain('בלם · P50')
})

test('age-group benchmarks use each metric\'s own measured game durations', () => {
  const player = playerWith([
    fixtureGame('g1', { passesTotal: 30, passesSuccess: 24, interceptions: 2, timeVideoStats: 60 }, { gameDuration: 80 }),
    fixtureGame('g2', { passesTotal: 30, passesSuccess: 24, timeVideoStats: 60 }, { gameDuration: 90 }),
    fixtureGame('g3', { passesTotal: 0, interceptions: 0, timeVideoStats: 0 }, { gameDuration: 120 }),
  ])
  const report = buildPerformanceReport({ player, target: 'age' })
  const shared = buildPerformanceShareReport({ player, report, view: 'normalized', target: 'age' })
  expect(shared.rows.find(row => row.id === 'passes').values.slice(3)).toEqual(['45', '87%'])
  expect(shared.rows.find(row => row.id === 'interceptions').values[3]).toBe('5.8')
})

test('explicit position and percentile selection replace the primary-position benchmark', () => {
  const player = playerWith([fixtureGame('g1', { passesTotal: 30, keyPassesTotal: 2, timeVideoStats: 60 })])
  const report = buildPerformanceReport({ player, target: '80' })
  const shared = buildPerformanceShareReport({ player, report, view: 'normalized', target: '80', positionId: 'DM', percentile: 'p75' })
  expect(shared.benchmark).toMatchObject({ positionId: 'DM', positionLabel: 'קשר אחורי', percentile: 'p75' })
  expect(shared.rows.find(row => row.id === 'keyPasses').values[3]).toBe('0.6')
  const unknown = buildPerformanceShareReport({ player, report, view: 'normalized', target: '80', positionId: '' })
  expect(unknown.benchmark.positionId).toBe('')
  expect(unknown.rows.every(row => row.values[3] === '—' && row.values[4] === '—')).toBe(true)
  expect(unknown.rows.every(row => row.cellTones.every(tone => tone === null))).toBe(true)
})

test.each([
  [91, 100, false, null], [90, 100, false, 'warning'], [80, 100, false, 'warning'],
  [79, 100, false, 'danger'], [101, 100, false, null], [0, 100, false, 'danger'],
  [110, 100, true, 'warning'], [120, 100, true, 'warning'], [121, 100, true, 'danger'],
  [90, 100, true, null], [1, 0, true, 'danger'], [0, 0, true, null],
  [null, 100, false, null], [50, null, false, null],
])('benchmark gap uses relative shortfall and metric direction (%s, %s, %s)', (actual, target, lowerIsBetter, expected) => {
  expect(getBenchmarkGapTone(actual, target, lowerIsBetter)).toBe(expected)
})

test('normalized player cells get independent backgrounds only when a matching reference exists', () => {
  const player = playerWith([fixtureGame('g1', {
    passesTotal: 27, passesSuccess: 21, ballLoss: 3, progressivePassesTotal: 2, timeVideoStats: 60,
  })])
  const report = buildPerformanceReport({ player, target: '80' })
  const shared = buildPerformanceShareReport({ player, report, view: 'normalized', target: '80' })
  expect(shared.rows.find(row => row.id === 'passes').cellTones).toEqual(['warning', null, 'warning'])
  expect(shared.rows.find(row => row.id === 'ballLoss').cellTones).toEqual(['danger', null, null])
  expect(shared.rows.find(row => row.id === 'progressivePasses').cellTones).toEqual([null, null, null])
  expect(shared.notes).toEqual([])
  const comparison = buildPositionComparison({ games: report.measuredGames, positionId: 'CD', minutes: 80 })
  expect(comparison.find(row => row.id === 'passesTotal').gapTone).toBe('warning')
  expect(comparison.find(row => row.id === 'ballLoss').gapTone).toBe('danger')
})

test('separate reference success counts remain quantities and never create an inferred success rate', () => {
  const player = playerWith([fixtureGame('g1', { shotsTotal: 2, shotsOnTarget: 1, timeVideoStats: 60 })])
  const report = buildPerformanceReport({ player, target: '90' })
  const shared = buildPerformanceShareReport({ player, report, view: 'normalized', target: '90', positionId: 'F' })
  const shots = shared.rows.find(row => row.id === 'shots')
  expect(shots.values[3]).toContain('סה״כ')
  expect(shots.values[3]).toContain('למסגרת')
  expect(shots.values[4]).toBe('—')
  expect(shots.cellTones[2]).toBeNull()
})

test.each(['passes', 'passesTotal', 'passesSuccess', 'progressivePasses', 'progressivePassesTotal', 'progressivePassesSuccess'])('passing counts use whole numbers for %s', id => {
  expect(formatPerformanceValue(20.3, false, { id })).toBe('20')
  expect(formatPerformanceValue(15.7, false, id)).toBe('16')
  expect(formatPerformanceValue(0, false, id)).toBe('0')
  expect(formatPerformanceValue(null, false, id)).toBe('—')
})

test('display rounding preserves precise normalization and keeps other metric decimals', () => {
  const player = playerWith([fixtureGame('g1', { passesTotal: 14, progressivePassesTotal: 4, timeVideoStats: 60 })])
  const report = buildPerformanceReport({ player, target: '80' })
  const shared = buildPerformanceShareReport({ player, report, view: 'normalized', target: '80' })
  expect(shared.rows.find(row => row.id === 'passes').values[0]).toBe('19')
  expect(shared.rows.find(row => row.id === 'progressivePasses').values[0]).toBe('5')
  expect(report.normalizedMetrics.find(row => row.id === 'passes').average).toBeCloseTo(18.6666666667)
  expect(formatPerformanceValue(1.7, false, 'dribbles')).toBe('1.7')
})

test('sharing can hide and restore any row or column without changing data or gap mapping', () => {
  const player = playerWith([fixtureGame('g1', { passesTotal: 14, passesSuccess: 12, ballLoss: 2, timeVideoStats: 60 })])
  const report = buildPerformanceReport({ player, target: '80' })
  const shared = buildPerformanceShareReport({ player, report, view: 'normalized', target: '80' })
  const original = JSON.stringify(shared)
  const filtered = filterPerformanceShareReport(shared, ['ballLoss'], ['מדד', 'הצלחות', 'תקן — כמות'])
  expect(filtered.columnIndices).toEqual([1, 3, 5])
  expect(filtered.rows.map(row => row.id)).toEqual(['passes'])
  expect(filtered.rows[0].cellTones).toEqual(shared.rows.find(row => row.id === 'passes').cellTones)
  const text = performanceShareText(filtered)
  expect(text).toContain('19 סה״כ')
  expect(text).not.toContain('איבודי כדור')
  expect(text).not.toContain('הצלחות')
  expect(text).not.toContain('תקן — כמות')
  expect(JSON.stringify(shared)).toBe(original)
  expect(filterPerformanceShareReport(shared).rows).toEqual(shared.rows)
})
