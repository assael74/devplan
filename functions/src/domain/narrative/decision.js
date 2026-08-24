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
  const activeEntry = entries.find(entry => entry?.isActiveSeason === true)
  if (activeEntry) return activeEntry

  const currentEntries = entries.filter(entry => clean(entry.sourceTarget) === 'current')
  const candidates = currentEntries.length ? currentEntries : entries

  return [...candidates]
    .filter(entry => clean(entry.seasonKey || entry.seasonId))
    .sort((left, right) => (
      resolveSeasonStartYear(right.seasonKey || right.seasonId) -
      resolveSeasonStartYear(left.seasonKey || left.seasonId)
    ))[0] || null
}

function resolveFutureOutlookFromPath(path = null) {
  const outlook = clean(path?.outlook).toLowerCase()

  if (outlook === 'risk') return 'competition_down'
  if (outlook === 'upside') return 'competition_up'
  if (outlook === 'stable') return 'competition_stable'
  if (outlook === 'mixed') return 'competition_mixed'

  return 'unknown'
}

function resolveFutureOutlookFromDelta(expectedLevelDelta) {
  const delta = numberOrNull(expectedLevelDelta)
  if (delta === null) return 'unknown'
  if (delta < 0) return 'competition_down'
  if (delta > 0) return 'competition_up'

  return 'competition_stable'
}

function resolveNextCompetitionLevel(path = null) {
  const steps = Array.isArray(path?.steps) ? path.steps : []
  const firstStep = steps.find(step => numberOrNull(step?.leagueLevel) !== null)

  return firstStep ? numberOrNull(firstStep.leagueLevel) : null
}

function buildDecisionContext({ context = {}, futureProjection = null } = {}) {
  const entries = Array.isArray(context.entries) ? context.entries : []
  const latestEntry = resolveLatestEntry(entries)
  const opportunity = latestEntry?.opportunity || null
  const playerInterest = latestEntry?.playerInterest || null
  const futurePath = latestEntry?.futureCompetitionPath || null
  const pathOutlook = resolveFutureOutlookFromPath(futurePath)
  const projectionDelta = numberOrNull(futureProjection?.expectedLevelDelta)
  const currentCompetitionLevel = numberOrNull(
    futurePath?.current?.leagueLevel !== undefined
      ? futurePath.current.leagueLevel
      : futureProjection?.leagueLevel !== undefined
        ? futureProjection.leagueLevel
        : latestEntry?.leagueLevel
  )
  const pathNextLevel = resolveNextCompetitionLevel(futurePath)
  const projectionNextLevel = projectionDelta !== null && currentCompetitionLevel !== null
    ? currentCompetitionLevel - projectionDelta
    : null
  const futureOutlook = pathOutlook !== 'unknown'
    ? pathOutlook
    : resolveFutureOutlookFromDelta(projectionDelta)

  return {
    seasonKey: clean(latestEntry?.seasonKey || latestEntry?.seasonId),
    interestLevel: clean(playerInterest?.interestLevel),
    playerInterestLevel: clean(playerInterest?.interestLevel),
    profileInterestLevel: clean(playerInterest?.profileInterestLevel),
    combinationInterestLevel: clean(playerInterest?.combinationInterestLevel),
    interestAssessment: playerInterest ? {
      assessmentScope: clean(playerInterest.assessmentScope),
      reasons: Array.isArray(playerInterest.reasons) ? playerInterest.reasons : [],
      limitingFactors: Array.isArray(playerInterest.limitingFactors)
        ? playerInterest.limitingFactors
        : [],
      upgradeConditions: Array.isArray(playerInterest.upgradeConditions)
        ? playerInterest.upgradeConditions
        : [],
    } : null,
    actionStatus: clean(opportunity?.effectiveActionStatus),
    automaticActionStatus: clean(opportunity?.automaticActionStatus),
    manualActionStatus: clean(opportunity?.manualActionStatus),
    hasManualDecision: Boolean(opportunity?.hasManualDecision),
    manualDecision: opportunity?.manualDecision || context.manualImmediacyDecision || null,
    baseActionStatus: clean(opportunity?.baseActionStatus),
    boostScore: numberOrNull(opportunity?.boostScore),
    reductionScore: numberOrNull(opportunity?.reductionScore),
    netScore: numberOrNull(opportunity?.netScore),
    boosts: Array.isArray(opportunity?.boosts) ? opportunity.boosts : [],
    reductions: Array.isArray(opportunity?.reductions) ? opportunity.reductions : [],
    signalPersistence: opportunity?.signalPersistence || null,
    exposureLevel: clean(opportunity?.exposureLevel),
    reasons: Array.isArray(opportunity?.reasons)
      ? opportunity.reasons.map(clean).filter(Boolean)
      : [],
    futureOutlook,
    futureCompetitionPath: futurePath,
    expectedLevelDelta: projectionDelta,
    currentCompetitionLevel,
    nextCompetitionLevel: pathNextLevel !== null ? pathNextLevel : projectionNextLevel,
    projectionSource: futurePath
      ? 'player_future_competition_path'
      : futureProjection ? 'team_search_index' : '',
  }
}

module.exports = { buildDecisionContext }
