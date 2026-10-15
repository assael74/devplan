// src/features/playersDatabase/ui/pages/teamPage/information/model/teamWorkspace.navigation.test.js

import {
  buildTeamWorkspaceUrl,
  buildTeamRosterSeasonUrl,
  resolveTeamWorkspace,
} from './teamWorkspace.navigation.js'

test('opens an insight while preserving unrelated team page parameters', () => {
  const url = buildTeamWorkspaceUrl({
    location: { pathname: '/team/example', search: '?fromLeague=%2Fleague&view=roster&fromInsight=performance' },
    mode: 'insight',
    insightId: 'club-gap',
  })

  expect(url).toBe('/team/example?fromLeague=%2Fleague&insight=club-gap')
  expect(resolveTeamWorkspace(url.split('?')[1])).toEqual({
    mode: 'insight', insightId: 'club-gap', sourceInsightId: '',
  })
})

test('roster retains the source insight for a direct return link', () => {
  const url = buildTeamWorkspaceUrl({
    location: { pathname: '/team/example', search: '?insight=performance' },
    mode: 'roster',
    sourceInsightId: 'performance',
  })

  expect(url).toBe('/team/example?view=roster&fromInsight=performance')
  expect(resolveTeamWorkspace(url.split('?')[1])).toEqual({
    mode: 'roster', insightId: '', sourceInsightId: 'performance',
  })
})

test('unknown insight returns to the overview', () => {
  expect(resolveTeamWorkspace('?insight=unknown')).toEqual({
    mode: 'overview', insightId: '', sourceInsightId: '',
  })
})

test('roster season selection leaves the active insight unchanged', () => {
  const location = {
    pathname: '/team/example',
    search: '?fromLeague=%2Fleague&insight=performance',
  }
  const seasonUrl = buildTeamRosterSeasonUrl({
    location,
    optionKey: '25/26|2012|u13-center|history',
  })

  expect(resolveTeamWorkspace(seasonUrl.split('?')[1])).toEqual({
    mode: 'insight',
    insightId: 'performance',
    sourceInsightId: '',
  })
  expect(new URLSearchParams(seasonUrl.split('?')[1]).get('rosterSeason'))
    .toBe('25/26|2012|u13-center|history')
  expect(buildTeamWorkspaceUrl({
    location: { pathname: location.pathname, search: seasonUrl.split('?')[1] },
    mode: 'insight',
    insightId: 'roster-balance',
  })).toBe(
    '/team/example?fromLeague=%2Fleague&rosterSeason=25%2F26%7C2012%7Cu13-center%7Chistory&insight=roster-balance'
  )
})

test('legacy analysis season is removed from new workspace links', () => {
  const location = {
    pathname: '/team/example',
    search: '?insight=performance&analysisSeason=25%2F26%7C2012%7Cu13-center%7Chistory',
  }
  const rosterUrl = buildTeamWorkspaceUrl({
    location,
    mode: 'roster',
    sourceInsightId: 'performance',
  })
  const roster = resolveTeamWorkspace(rosterUrl.split('?')[1])

  expect(roster.mode).toBe('roster')
  expect(roster.sourceInsightId).toBe('performance')
  expect(new URLSearchParams(rosterUrl.split('?')[1]).has('analysisSeason')).toBe(false)
})

test('roster season replaces a legacy analysis season without changing the insight', () => {
  const location = {
    pathname: '/team/example',
    search: '?insight=performance&analysisSeason=26%2F27',
  }
  const url = buildTeamRosterSeasonUrl({ location, optionKey: '25/26' })

  expect(resolveTeamWorkspace(url.split('?')[1])).toEqual({
    mode: 'insight',
    insightId: 'performance',
    sourceInsightId: '',
  })
  expect(new URLSearchParams(url.split('?')[1]).get('rosterSeason')).toBe('25/26')
  expect(new URLSearchParams(url.split('?')[1]).has('analysisSeason')).toBe(false)
})
