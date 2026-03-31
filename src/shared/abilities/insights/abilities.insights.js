// src/shared/abilities/insights/abilities.insights.js

import {
  fmtScore,
  roundTo,
  getAbilityScoreHex,
  getAbilityGapHex,
  getAbilitySemanticHex,
} from '../abilities.utils.js'
import { resolveAbilitiesDomain, resolveTeamAbilitiesDomain } from '../abilities.domain.logic.js'
import {
  resolvePlayerAbilitiesInsightsEligibility,
  resolveTeamAbilitiesInsightsEligibility,
} from './abilities.insights.eligibility.js'
import {
  ABILITIES_INSIGHTS_LABELS,
  getBalanceLabel,
  getScoreColor,
} from './abilities.insights.labels.js'
import {
  resolvePlayerDomainPotentialScores,
  resolvePlayerDomainScores,
  resolvePlayerFullName,
  resolvePlayerLevel,
  resolvePlayerPotential,
  resolvePlayerEvaluation,
  resolvePlayerWindows,
} from '../abilities.resolvers.js'

function buildInsight({
  id,
  kind = 'summary',
  scope = 'general',
  priority = 1,
  color = 'neutral',
  title = '',
  text = '',
  meta = {},
}) {
  return {
    id,
    kind,
    scope,
    priority,
    color,
    title,
    text,
    meta,
  }
}

function getPerformanceDomains(domains = []) {
  return (domains || []).filter((d) => d?.domain !== 'development')
}

function buildPlayerReadinessInsight(eligibility) {
  if (eligibility?.isEligible) {
    return buildInsight({
      id: 'player-readiness-ok',
      kind: 'readiness',
      priority: ABILITIES_INSIGHTS_LABELS.priorities.readiness,
      color: 'success',
      title: ABILITIES_INSIGHTS_LABELS.readiness.player.readyTitle,
      text: 'יש מספיק בסיס נתונים לניתוח מהימן של היכולות.',
      meta: eligibility,
    })
  }

  return buildInsight({
    id: 'player-readiness-missing',
    kind: 'readiness',
    priority: ABILITIES_INSIGHTS_LABELS.priorities.readiness,
    color: 'warning',
    title: ABILITIES_INSIGHTS_LABELS.readiness.player.notReadyTitle,
    text: 'נדרש חיזוק בכיסוי ובמספר הדומיינים התקפים לפני תובנות מלאות.',
    meta: eligibility,
  })
}

function buildPlayerStrengthWeaknessInsights(domainResult) {
  const performanceDomains = getPerformanceDomains(domainResult?.domains || [])
  const ratedDomains = performanceDomains.filter((d) => Number.isFinite(Number(d?.avg)))

  if (!ratedDomains.length) return []

  const strongest = ratedDomains.reduce((a, b) => (Number(a.avg) >= Number(b.avg) ? a : b))
  const weakest = ratedDomains.reduce((a, b) => (Number(a.avg) <= Number(b.avg) ? a : b))

  return [
    buildInsight({
      id: 'player-strongest-domain',
      kind: 'strength',
      scope: 'general',
      priority: ABILITIES_INSIGHTS_LABELS.priorities.strongestDomain,
      color: getScoreColor(strongest?.avg),
      title: ABILITIES_INSIGHTS_LABELS.titles.player.strongestDomain,
      text: `${strongest?.domainLabel} הוא הדומיין המוביל עם ממוצע ${fmtScore(strongest?.avg)}.`,
      meta: strongest,
    }),
    buildInsight({
      id: 'player-weakest-domain',
      kind: 'gap',
      scope: 'general',
      priority: ABILITIES_INSIGHTS_LABELS.priorities.weakestDomain,
      color: getScoreColor(weakest?.avg),
      title: ABILITIES_INSIGHTS_LABELS.titles.player.weakestDomain,
      text: `${weakest?.domainLabel} הוא הדומיין החלש ביותר עם ממוצע ${fmtScore(weakest?.avg)}.`,
      meta: weakest,
    }),
  ]
}

function buildPlayerBiggestPotentialGapDomainInsight(player = {}, domainResult = {}) {
  const performanceDomains = getPerformanceDomains(domainResult?.domains || [])
  const domainScores = resolvePlayerDomainScores(player)
  const domainPotentialScores = resolvePlayerDomainPotentialScores(player)

  const rows = performanceDomains
    .map((domain) => {
      const score = Number(domainScores?.[domain.domain])
      const potentialScore = Number(domainPotentialScores?.[domain.domain])

      if (!Number.isFinite(score) || !Number.isFinite(potentialScore)) return null

      return {
        domain: domain.domain,
        domainLabel: domain.domainLabel,
        score,
        potentialScore,
        gap: roundTo(potentialScore - score, 1),
      }
    })
    .filter(Boolean)
    .sort((a, b) => Number(b.gap) - Number(a.gap))

  const top = rows[0] || null
  if (!top) return null

  let color = 'warning'
  if (top.gap >= 0.7) color = 'success'
  else if (top.gap >= 0.35) color = 'primary'
  else if (top.gap > 0) color = 'warning'
  else color = 'neutral'

  return buildInsight({
    id: 'player-biggest-potential-gap-domain',
    kind: 'potential',
    scope: 'domain',
    priority: ABILITIES_INSIGHTS_LABELS.priorities.biggestPotentialGapDomain,
    color,
    title: ABILITIES_INSIGHTS_LABELS.titles.player.biggestPotentialGapDomain,
    text:
      top.gap > 0
        ? `${top.domainLabel} הוא הדומיין עם פער הפוטנציאל הגדול ביותר: ${fmtScore(top.score)} → ${fmtScore(top.potentialScore)} (${fmtScore(top.gap)}+).`
        : `${top.domainLabel} הוא הדומיין עם הפער הקטן ביותר בין הרמה הנוכחית לפוטנציאל.`,
    meta: top,
  })
}

function buildPlayerBalanceInsight(domainResult) {
  const performanceDomains = getPerformanceDomains(domainResult?.domains || [])
  const ratedDomains = performanceDomains.filter((d) => Number.isFinite(Number(d?.avg)))

  if (ratedDomains.length < 2) return null

  const max = Math.max(...ratedDomains.map((d) => Number(d.avg)))
  const min = Math.min(...ratedDomains.map((d) => Number(d.avg)))
  const gap = roundTo(max - min, 1)
  const balanceLabel = getBalanceLabel(gap)

  return buildInsight({
    id: 'player-balance',
    kind: 'profile',
    scope: 'general',
    priority: ABILITIES_INSIGHTS_LABELS.priorities.balance,
    color: gap <= 0.6 ? 'success' : gap <= 1.2 ? 'warning' : 'danger',
    title: ABILITIES_INSIGHTS_LABELS.titles.player.balance,
    text: `הפרופיל ${balanceLabel}. הפער בין הדומיין החזק לחלש הוא ${fmtScore(gap)}.`,
    meta: {
      gap,
      balanceLabel,
    },
  })
}

function buildPlayerPotentialInsight(player = {}) {
  const level = resolvePlayerLevel(player)
  const levelPotential = resolvePlayerPotential(player)

  if (!Number.isFinite(level) || !Number.isFinite(levelPotential)) return null

  const gap = roundTo(levelPotential - level, 1)
  let text = ''
  let color = 'neutral'

  if (gap >= 1) {
    text = `יש פער פוטנציאל משמעותי של ${fmtScore(gap)} בין הרמה הנוכחית לפוטנציאל.`
    color = 'success'
  } else if (gap > 0) {
    text = `יש עוד מרווח התפתחות של ${fmtScore(gap)} מעל הרמה הנוכחית.`
    color = 'primary'
  } else {
    text = 'הרמה הנוכחית קרובה מאוד לפוטנציאל המחושב.'
    color = 'warning'
  }

  return buildInsight({
    id: 'player-potential-gap',
    kind: 'potential',
    scope: 'general',
    priority: ABILITIES_INSIGHTS_LABELS.priorities.potentialGap,
    color,
    title: ABILITIES_INSIGHTS_LABELS.titles.player.potentialGap,
    text,
    meta: {
      level,
      levelPotential,
      gap,
    },
  })
}

function buildPlayerEvaluatorInsight(player = {}) {
  const evaluation = resolvePlayerEvaluation(player)

  const formsCount = Number(evaluation?.formsCount || 0)
  const windowsCount = Number(evaluation?.windowsCount || 0)
  const evaluatorsCount = Number(evaluation?.evaluatorsCount || 0)

  return buildInsight({
    id: 'player-windows',
    kind: 'history',
    priority: 60,
    color: formsCount >= 2 ? 'primary' : 'neutral',
    text: `קיימים ${windowsCount} חלונות הערכה, ${formsCount} טפסים ו־${evaluatorsCount} מעריכים בבסיס החישוב.`,
  })
}

export function resolvePlayerAbilitiesInsights(player = {}, options = {}) {
  const eligibility = resolvePlayerAbilitiesInsightsEligibility(player, options)
  const domainResult = resolveAbilitiesDomain(player)
  const x = buildPlayerEvaluatorInsight(player)

  const insights = [
    buildPlayerReadinessInsight(eligibility),
    ...buildPlayerStrengthWeaknessInsights(domainResult),
    buildPlayerBiggestPotentialGapDomainInsight(player, domainResult),
    buildPlayerBalanceInsight(domainResult),
    buildPlayerPotentialInsight(player),
    buildPlayerEvaluatorInsight(player),
  ].filter(Boolean)

  return {
    playerName: resolvePlayerFullName(player),
    isEligible: eligibility?.isEligible || false,
    eligibility,
    summary: domainResult?.summary || null,
    domains: domainResult?.domains || [],
    insights: insights.sort((a, b) => b.priority - a.priority),
  }
}

function buildTeamReadinessInsight(eligibility) {
  if (eligibility?.isEligible) {
    return buildInsight({
      id: 'team-readiness-ok',
      kind: 'readiness',
      priority: ABILITIES_INSIGHTS_LABELS.priorities.readiness,
      color: 'success',
      title: ABILITIES_INSIGHTS_LABELS.readiness.team.readyTitle,
      text: `${eligibility?.summary?.eligiblePlayersCount || 0} שחקנים עומדים בתנאי הסף.`,
      meta: eligibility,
    })
  }

  return buildInsight({
    id: 'team-readiness-missing',
    kind: 'readiness',
    priority: ABILITIES_INSIGHTS_LABELS.priorities.readiness,
    color: 'warning',
    title: ABILITIES_INSIGHTS_LABELS.readiness.team.notReadyTitle,
    text: `כרגע רק ${eligibility?.summary?.eligiblePlayersCount || 0} שחקנים עומדים בתנאי הסף.`,
    meta: eligibility,
  })
}

function buildTeamIdentityInsights(teamDomainResult) {
  const ratedDomains = getPerformanceDomains(teamDomainResult?.domains || []).filter((d) =>
    Number.isFinite(Number(d?.avg))
  )

  if (!ratedDomains.length) return []

  const strongest = ratedDomains.reduce((a, b) => (Number(a.avg) >= Number(b.avg) ? a : b))
  const weakest = ratedDomains.reduce((a, b) => (Number(a.avg) <= Number(b.avg) ? a : b))

  return [
    buildInsight({
      id: 'team-identity',
      kind: 'identity',
      priority: ABILITIES_INSIGHTS_LABELS.priorities.strongestDomain,
      color: getScoreColor(strongest?.avg),
      title: ABILITIES_INSIGHTS_LABELS.titles.team.identity,
      text: `הזהות הבולטת של הקבוצה היא ${strongest?.domainLabel} עם ממוצע ${fmtScore(strongest?.avg)}.`,
      meta: strongest,
    }),
    buildInsight({
      id: 'team-main-gap',
      kind: 'gap',
      priority: ABILITIES_INSIGHTS_LABELS.priorities.weakestDomain,
      color: getScoreColor(weakest?.avg),
      title: ABILITIES_INSIGHTS_LABELS.titles.team.mainGap,
      text: `${weakest?.domainLabel} הוא כרגע הדומיין הקבוצתי החלש ביותר עם ממוצע ${fmtScore(weakest?.avg)}.`,
      meta: weakest,
    }),
  ]
}

function buildTeamDepthInsight(teamEligibility) {
  const eligible = teamEligibility?.summary?.eligiblePlayersCount || 0
  const total = teamEligibility?.summary?.playersCount || 0
  const pct = teamEligibility?.summary?.eligiblePct || 0

  return buildInsight({
    id: 'team-depth',
    kind: 'depth',
    priority: ABILITIES_INSIGHTS_LABELS.priorities.teamDepth,
    color: pct >= 75 ? 'success' : pct >= 60 ? 'primary' : 'warning',
    title: ABILITIES_INSIGHTS_LABELS.titles.team.depth,
    text: `${eligible} מתוך ${total} שחקנים עומדים בתנאי הסף, שהם ${pct}% מהסגל.`,
    meta: { eligible, total, pct },
  })
}

function buildTeamMissingPlayersInsight(teamEligibility) {
  const players = (teamEligibility?.ineligiblePlayers || []).slice(0, 5)

  if (!players.length) return null

  return buildInsight({
    id: 'team-missing-players',
    kind: 'coverage',
    priority: ABILITIES_INSIGHTS_LABELS.priorities.missingPlayers,
    color: 'warning',
    title: ABILITIES_INSIGHTS_LABELS.titles.team.missingPlayers,
    text: players.map((item) => item.playerName).join(' · '),
    meta: players,
  })
}

export function resolveTeamAbilitiesInsights(entity = {}, context = {}, options = {}) {
  const eligibility = resolveTeamAbilitiesInsightsEligibility(entity, context, options)
  const domainResult = resolveTeamAbilitiesDomain(entity, context)

  const insights = [
    buildTeamReadinessInsight(eligibility),
    ...buildTeamIdentityInsights(domainResult),
    buildTeamDepthInsight(eligibility),
    buildTeamMissingPlayersInsight(eligibility),
  ].filter(Boolean)

  return {
    isEligible: eligibility?.isEligible || false,
    eligibility,
    summary: domainResult?.summary || null,
    domains: domainResult?.domains || [],
    players: domainResult?.players || [],
    insights: insights.sort((a, b) => b.priority - a.priority),
  }
}
