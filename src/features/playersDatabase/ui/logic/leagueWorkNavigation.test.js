// src/features/playersDatabase/ui/logic/leagueWorkNavigation.test.js

import { PLAYERS_DATABASE_UI_ROUTES as routes } from './routeBuilders.js'
import {
  buildLeagueWorkSearchParams,
  LEAGUE_RESEARCH_FILTER_LABELS,
  LEAGUE_LOADING_FILTER_LABELS,
  readLeagueWorkNavigation,
} from './leagueWorkNavigation.js'

test.each(Object.keys(LEAGUE_LOADING_FILTER_LABELS))('opens and restores the %s loading drill-down with context', filter => {
  const route = routes.league('league-1', {
    seasonKey: '26/27', birthYear: 2012, workFilter: filter,
    centerSeasonKey: '26/27', centerBirthYear: '2012',
  })
  const params = new URL(route, 'http://localhost').searchParams
  expect(readLeagueWorkNavigation(params)).toEqual({ researchMode: false, filter })
  expect(params.get('s')).toBe('26/27')
  expect(params.get('cs')).toBe('26/27')
  expect(readLeagueWorkNavigation(buildLeagueWorkSearchParams({ searchParams: params, researchMode: false }))).toEqual({
    researchMode: false, filter: 'all',
  })
})

test.each(Object.keys(LEAGUE_RESEARCH_FILTER_LABELS))('opens and restores the %s League work filter', filter => {
  const route = routes.league('league-1', {
    seasonKey: '26/27', birthYear: 2012,
    centerSeasonKey: '26/27,25/26', centerBirthYear: '2012,2011',
    workMode: 'research', workFilter: filter,
  })
  const params = new URL(route, 'http://localhost').searchParams
  expect(readLeagueWorkNavigation(params)).toEqual({ researchMode: true, filter })
  expect(params.get('s')).toBe('26/27')
  expect(params.get('y')).toBe('2012')
  expect(params.get('cs')).toBe('26/27,25/26')
  expect(params.get('cy')).toBe('2012,2011')
})

test.each(['', 'wm=research&wf=unknown', 'wf=pendingStrong', 'wm=load&wf=pendingWatch'])(
  'invalid or incompatible work filters fall back to all teams: %s', query => {
    expect(readLeagueWorkNavigation(new URLSearchParams(query)).filter).toBe('all')
  }
)

test('clearing or changing mode preserves season, center and audit context', () => {
  const original = new URLSearchParams('s=26%2F27&y=2012&cs=26%2F27&repairReload=1&wm=research&wf=pendingStrong')
  const cleared = buildLeagueWorkSearchParams({ searchParams: original, researchMode: true })
  expect(readLeagueWorkNavigation(cleared)).toEqual({ researchMode: true, filter: 'all' })
  expect(cleared.get('s')).toBe('26/27')
  expect(cleared.get('cs')).toBe('26/27')
  expect(cleared.get('repairReload')).toBe('1')
  expect(original.get('wf')).toBe('pendingStrong')
  const loading = buildLeagueWorkSearchParams({ searchParams: cleared, researchMode: false })
  expect(readLeagueWorkNavigation(loading)).toEqual({ researchMode: false, filter: 'all' })
  expect(loading.has('wm')).toBe(false)
  expect(loading.has('wf')).toBe(false)
})

test('existing League KPI filters remain supported in their work modes', () => {
  expect(readLeagueWorkNavigation(new URLSearchParams('wf=missingStats'))).toEqual({
    researchMode: false, filter: 'missingStats',
  })
  expect(readLeagueWorkNavigation(new URLSearchParams('wm=research&wf=strongSignals'))).toEqual({
    researchMode: true, filter: 'strongSignals',
  })
})
