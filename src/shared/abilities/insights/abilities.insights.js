// src/shared/abilities/insights/abilities.insights.js

import { fmtScore, roundTo } from '../abilities.utils.js'
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
  resolvePlayerFullName,
  resolvePlayerLevel,
  resolvePlayerPotential,
  resolvePlayerSnapshotsMeta,
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
      text: `יש מספיק בסיס נתונים לניתוח מהימן של היכולות.`,
      meta: eligibility,
    })
  }

  return buildInsight({
    id: 'player-readiness-missing',
    kind: 'readiness',
    priority: ABILITIES_INSIGHTS_LABELS.priorities.readiness,
    color: 'warning',
    title: ABILITIES_INSIGHTS_LABELS.readiness.player.notReadyTitle,
    text: `נדרש חיזוק בכיסוי ובמספר הדומיינים התקפים לפני תובנות מלאות.`,
    meta: eligibility,
  })
}

function buildPlayerStrengthWeaknessInsights(domainResult) {
  const ratedDomains = getPerformanceDomains(domainResult?.domains || []).filter((d) =>
    Number.isFinite(Number(d?.avg))
  )

  if (!ratedDomains.length) return []

  const strongest = ratedDomains.reduce((a, b) => (Number(a.avg) >= Number(b.avg) ? a : b))
  const weakest = ratedDomains.reduce((a, b) => (Number(a.avg) <= Number(b.avg) ? a : b))

  return [
    buildInsight({
      id: 'player-strongest-domain',
      kind: 'strength',
      priority: ABILITIES_INSIGHTS_LABELS.priorities.strongestDomain,
      color: getScoreColor(strongest?.avg),
      title: ABILITIES_INSIGHTS_LABELS.titles.player.strongestDomain,
      text: `${strongest?.domainLabel} הוא הדומיין המוביל עם ממוצע ${fmtScore(strongest?.avg)}.`,
      meta: strongest,
    }),
    buildInsight({
      id: 'player-weakest-domain',
      kind: 'gap',
      priority: ABILITIES_INSIGHTS_LABELS.priorities.weakestDomain,
      color: getScoreColor(weakest?.avg),
      title: ABILITIES_INSIGHTS_LABELS.titles.player.weakestDomain,
      text: `${weakest?.domainLabel} הוא הדומיין החלש ביותר עם ממוצע ${fmtScore(weakest?.avg)}.`,
      meta: weakest,
    }),
  ]
}

function buildPlayerBalanceInsight(domainResult) {
  const ratedDomains = getPerformanceDomains(domainResult?.domains || []).filter((d) =>
    Number.isFinite(Number(d?.avg))
  )

  if (ratedDomains.length < 2) return null

  const max = Math.max(...ratedDomains.map((d) => Number(d.avg)))
  const min = Math.min(...ratedDomains.map((d) => Number(d.avg)))
  const gap = roundTo(max - min, 1)
  const balanceLabel = getBalanceLabel(gap)

  return buildInsight({
    id: 'player-balance',
    kind: 'profile',
    priority: ABILITIES_INSIGHTS_LABELS.priorities.balance,
    color: gap <= 0.6 ? 'success' : gap <= 1.2 ? 'warning' : 'danger',
    title: ABILITIES_INSIGHTS_LABELS.titles.player.balance,
    text: `הפרופיל ${balanceLabel}. הפער בין הדומיין החזק לחלש הוא ${fmtScore(gap)}.`,
    meta: { gap, balanceLabel },
  })
}

function buildPlayerPotentialInsight(player = {}) {
  const level = resolvePlayerLevel(player)
  const levelPotential = resolvePlayerPotential(player)

  if (!Number.isFinite(level) || !Number.isFinite(levelPotential)) return null

  const gap = roundTo(levelPotential - level, 1)

  if (gap >= 1) {
    return buildInsight({
      id: 'player-potential-gap',
      kind: 'potential',
      priority: ABILITIES_INSIGHTS_LABELS.priorities.potentialGap,
      color: 'success',
      title: ABILITIES_INSIGHTS_LABELS.titles.player.potentialGap,
      text: `יש פער פוטנציאל משמעותי של ${fmtScore(gap)} בין הרמה הנוכחית לפוטנציאל.`,
      meta: { level, levelPotential, gap },
    })
  }

  if (gap > 0) {
    return buildInsight({
      id: 'player-potential-gap',
      kind: 'potential',
      priority: ABILITIES_INSIGHTS_LABELS.priorities.potentialGap,
      color: 'primary',
      title: ABILITIES_INSIGHTS_LABELS.titles.player.potentialGap,
      text: `יש עוד מרווח התפתחות של ${fmtScore(gap)} מעל הרמה הנוכחית.`,
      meta: { level, levelPotential, gap },
    })
  }

  return buildInsight({
    id: 'player-potential-gap',
    kind: 'potential',
    priority: ABILITIES_INSIGHTS_LABELS.priorities.potentialGap,
    color: 'warning',
    title: ABILITIES_INSIGHTS_LABELS.titles.player.potentialGap,
    text: 'הרמה הנוכחית קרובה מאוד לפוטנציאל המחושב.',
    meta: { level, levelPotential, gap },
  })
}

function buildPlayerWindowsInsight(player = {}) {
  const snapshotsMeta = resolvePlayerSnapshotsMeta(player)
  const windows = resolvePlayerWindows(player)
  const windowsCount = Number(snapshotsMeta?.windowsCount || windows.length || 0)
  const formsCount = Number(snapshotsMeta?.formsCount || 0)

  return buildInsight({
    id: 'player-windows',
    kind: 'history',
    priority: 60,
    color: windowsCount >= 2 ? 'primary' : 'neutral',
    title: ABILITIES_INSIGHTS_LABELS.titles.player.windows,
    text: `קיימים ${windowsCount} חלונות הערכה ו־${formsCount} טפסים בבסיס החישוב.`,
    meta: snapshotsMeta,
  })
}

export function resolvePlayerAbilitiesInsights(player = {}, options = {}) {
  const eligibility = resolvePlayerAbilitiesInsightsEligibility(player, options)
  const domainResult = resolveAbilitiesDomain(player)

  const insights = [
    buildPlayerReadinessInsight(eligibility),
    ...buildPlayerStrengthWeaknessInsights(domainResult),
    buildPlayerBalanceInsight(domainResult),
    buildPlayerPotentialInsight(player),
    buildPlayerWindowsInsight(player),
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
    priority: ABILITIES_INSIGHTS_LABELS.priorities.depth,
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
