import { normalizeComparableValue } from '../../shared/valueComparison.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const same = (left, right) => JSON.stringify(normalizeComparableValue(left)) ===
  JSON.stringify(normalizeComparableValue(right))

const findLeague = ({ master = {}, leagueId = '' } = {}) => (
  (Array.isArray(master?.leagues) ? master.leagues : [])
    .find(row => clean(row?.leagueId || row?.leagueDocumentId) === clean(leagueId)) || null
)

const findSeason = ({ league = {}, seasonKey = '' } = {}) => (
  (Array.isArray(league?.seasons) ? league.seasons : [])
    .find(row => clean(row?.seasonKey || row?.seasonId) === clean(seasonKey)) || null
)

export function compareRosterLeaguesMasterV2({
  expected = {},
  actual = {},
} = {}) {
  const league = findLeague({
    master: actual,
    leagueId: expected.leagueId,
  })

  if (!league) {
    return [{
      type: 'missing_projection',
      target: 'leaguesMaster',
      documentId: 'all',
      reason: 'The current League entry is missing from Leagues Master.',
      expected,
      actual: null,
    }]
  }

  const season = findSeason({
    league,
    seasonKey: expected.seasonKey,
  })

  if (!season) {
    return [{
      type: 'missing_projection',
      target: 'leaguesMaster',
      documentId: 'all',
      reason: 'The current League season entry is missing from Leagues Master.',
      expected,
      actual: null,
    }]
  }

  const hasPlayersCount = season.playersCount !== undefined &&
    season.playersCount !== null

  const actualOwned = {
    playersCount: hasPlayersCount
      ? Number(season.playersCount)
      : undefined,
  }

  if (same(actualOwned, expected.fields || {})) return []

  return [{
    type: 'projection_mismatch',
    target: 'leaguesMaster',
    documentId: 'all',
    reason: 'Roster-owned Leagues Master playersCount does not match the canonical League.',
    expected: expected.fields,
    actual: actualOwned,
  }]
}
