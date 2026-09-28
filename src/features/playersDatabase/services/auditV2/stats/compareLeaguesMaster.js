import {
  normalizeComparableValue,
} from '../../shared/valueComparison.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const same = (left, right) => (
  JSON.stringify(normalizeComparableValue(left)) ===
  JSON.stringify(normalizeComparableValue(right))
)

const findLeague = ({
  master = {},
  leagueId = '',
} = {}) => (
  (Array.isArray(master?.leagues)
    ? master.leagues
    : []).find(row => (
    clean(row?.leagueId || row?.leagueDocumentId) ===
    clean(leagueId)
  )) || null
)

const findSeason = ({
  league = {},
  seasonKey = '',
} = {}) => (
  (Array.isArray(league?.seasons)
    ? league.seasons
    : []).find(row => (
    clean(row?.seasonKey || row?.seasonId) ===
    clean(seasonKey)
  )) || null
)

export function compareStatsLeaguesMasterV2({
  expected = {},
  actual = {},
} = {}) {
  const league = findLeague({
    master: actual,
    leagueId: expected.leagueId,
  })
  const season = league
    ? findSeason({
        league,
        seasonKey: expected.seasonKey,
      })
    : null

  if (!season) {
    return [{
      type: 'missing_projection',
      target: 'leaguesMaster',
      documentId: 'all',
      reason: 'Stats League season entry is missing from Leagues Master.',
      expected: expected.fields,
      actual: null,
    }]
  }

  const actualOwned = Object.fromEntries(
    Object.keys(expected.fields || {}).map(key => [
      key,
      season[key] === undefined || season[key] === null
        ? undefined
        : Number(season[key]),
    ])
  )

  if (same(actualOwned, expected.fields || {})) return []

  return [{
    type: 'projection_mismatch',
    target: 'leaguesMaster',
    documentId: 'all',
    reason: 'Stats-owned Leagues Master counters do not match canonical League.',
    expected: expected.fields,
    actual: actualOwned,
  }]
}
