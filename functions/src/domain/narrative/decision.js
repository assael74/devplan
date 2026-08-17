// C:\projects\devplan\functions\src\domain\narrative\decision.js

function clean(value) {
  return String(value || '').trim()
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function resolveSeasonStartYear(value) {
  const match = clean(value).match(/^(\d{2,4})\/(\d{2,4})$/)
  if (!match) return 0

  const year = Number(match[1])
  if (!Number.isFinite(year)) return 0

  return year < 100 ? 2000 + year : year
}

function resolveLatestEntry(entries = []) {
  return [...entries]
    .filter(entry => clean(entry.seasonKey || entry.seasonId))
    .sort((left, right) => (
      resolveSeasonStartYear(right.seasonKey || right.seasonId) -
      resolveSeasonStartYear(left.seasonKey || left.seasonId)
    ))[0] || null
}

function resolveFutureOutlook(expectedLevelDelta) {
  const delta = numberOrNull(expectedLevelDelta)
  if (delta === null) return 'unknown'
  if (delta < 0) return 'competition_down'
  if (delta > 0) return 'competition_up'

  return 'competition_stable'
}

function buildDecisionContext({ context = {}, futureProjection = null } = {}) {
  const entries = Array.isArray(context.entries) ? context.entries : []
  const latestEntry = resolveLatestEntry(entries)
  const opportunity = latestEntry?.priority || null
  const expectedLevelDelta = numberOrNull(futureProjection?.expectedLevelDelta)
  const currentCompetitionLevel = numberOrNull(
    futureProjection?.leagueLevel !== undefined
      ? futureProjection.leagueLevel
      : latestEntry?.leagueLevel
  )
  const nextCompetitionLevel = expectedLevelDelta !== null && currentCompetitionLevel !== null
    ? currentCompetitionLevel - expectedLevelDelta
    : null

  return {
    seasonKey: clean(latestEntry?.seasonKey || latestEntry?.seasonId),
    actionStatus: clean(opportunity?.actionStatus),
    exposureLevel: clean(opportunity?.exposureLevel),
    reasons: Array.isArray(opportunity?.reasons)
      ? opportunity.reasons.map(clean).filter(Boolean)
      : [],
    futureOutlook: resolveFutureOutlook(expectedLevelDelta),
    expectedLevelDelta,
    currentCompetitionLevel,
    nextCompetitionLevel,
    projectionSource: futureProjection ? 'team_search_index' : '',
  }
}

module.exports = { buildDecisionContext }
