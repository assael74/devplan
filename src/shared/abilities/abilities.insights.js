// shared/abilities/abilities.insights.js

import { abilitiesList } from './abilities.list.js'
import { fmtScore, isRated, roundTo } from './abilities.utils.js'
import {
  resolvePlayerAbilitiesInsightsEligibility,
  resolveTeamAbilitiesInsightsEligibility,
} from './abilities.insights.eligibility.js'
import {
  resolveAbilitiesDomain,
  resolveTeamAbilitiesDomain,
} from './abilities.domain.logic.js'

function getPlayerAbilities(entity = {}) {
  return (
    entity?.abilities ||
    entity?.playerAbilities ||
    entity?.playersAbilities ||
    entity?.playerAbilitiesValues ||
    {}
  )
}

function getAbilityMetaMap() {
  const map = new Map()
  for (const item of abilitiesList) {
    map.set(item.id, item)
  }
  return map
}

function getPerformanceDomains(domains = []) {
  return (domains || []).filter((d) => d?.domain !== 'development')
}

function getRatedItems(items = []) {
  return (items || []).filter((item) => isRated(item?.value))
}

function getTopItems(items = [], limit = 3, mode = 'desc') {
  const rated = getRatedItems(items)

  const sorted = rated.sort((a, b) => {
    const av = Number(a?.value ?? a?.avg ?? 0)
    const bv = Number(b?.value ?? b?.avg ?? 0)
    return mode === 'asc' ? av - bv : bv - av
  })

  return sorted.slice(0, limit)
}

function buildInsight({
  id,
  kind = 'summary',
  scope = 'general',
  priority = 1,
  color = 'neutral',
  title,
  text,
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

function rankBalanceLabel(gap) {
  if (!Number.isFinite(Number(gap))) return 'לא ידוע'
  if (gap <= 0.6) return 'מאוזן'
  if (gap <= 1.2) return 'עם פערים מתונים'
  return 'לא מאוזן'
}

function scoreToColor(score) {
  const n = Number(score)
  if (!Number.isFinite(n)) return 'neutral'
  if (n >= 4) return 'success'
  if (n >= 3) return 'primary'
  if (n >= 2) return 'warning'
  return 'danger'
}

function buildPlayerReadinessInsight(eligibility) {
  if (eligibility?.isEligible) {
    return buildInsight({
      id: 'player-readiness-ok',
      kind: 'readiness',
      scope: 'general',
      priority: 100,
      color: 'success',
      title: 'התיעוד מספק לתובנות',
      text: `יש תיעוד מספק להתפתחות ועוד ${eligibility?.summary?.documentedPerformanceDomains || 0} דומיינים מקצועיים.`,
      meta: eligibility,
    })
  }

  const reasons = []

  if (!eligibility?.summary?.hasDevelopment) {
    reasons.push('חסר תיעוד בדומיין התפתחות')
  }

  const missingDomains = Math.max(
    0,
    (eligibility?.thresholds?.minDocumentedPerformanceDomains || 0) -
      (eligibility?.summary?.documentedPerformanceDomains || 0)
  )

  if (missingDomains > 0) {
    reasons.push(`חסרים עוד ${missingDomains} דומיינים מקצועיים עם תיעוד מספק`)
  }

  return buildInsight({
    id: 'player-readiness-missing',
    kind: 'readiness',
    scope: 'general',
    priority: 100,
    color: 'warning',
    title: 'אין עדיין מספיק תיעוד לתובנות מלאות',
    text: reasons.join(' · '),
    meta: eligibility,
  })
}

function buildTeamReadinessInsight(eligibility) {
  if (eligibility?.isEligible) {
    return buildInsight({
      id: 'team-readiness-ok',
      kind: 'readiness',
      scope: 'general',
      priority: 100,
      color: 'success',
      title: 'לקבוצה יש תיעוד מספק לתובנות',
      text: `${eligibility?.summary?.eligiblePlayersCount || 0} שחקנים עומדים בתנאי הסף.`,
      meta: eligibility,
    })
  }

  return buildInsight({
    id: 'team-readiness-missing',
    kind: 'readiness',
    scope: 'general',
    priority: 100,
    color: 'warning',
    title: 'אין עדיין מספיק תיעוד קבוצתי לתובנות מלאות',
    text: `כרגע רק ${eligibility?.summary?.eligiblePlayersCount || 0} שחקנים עומדים בתנאי הסף. נדרשים לפחות ${eligibility?.thresholds?.minEligiblePlayersForTeam || 11}.`,
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
      priority: 90,
      color: scoreToColor(strongest?.avg),
      title: 'הדומיין המוביל',
      text: `${strongest?.domainLabel} הוא הדומיין המוביל עם ממוצע ${fmtScore(strongest?.avg)}.`,
      meta: strongest,
    }),
    buildInsight({
      id: 'player-weakest-domain',
      kind: 'gap',
      scope: 'general',
      priority: 89,
      color: scoreToColor(weakest?.avg),
      title: 'הדומיין החלש ביותר',
      text: `${weakest?.domainLabel} הוא הדומיין החלש ביותר עם ממוצע ${fmtScore(weakest?.avg)}.`,
      meta: weakest,
    }),
  ]
}

function buildPlayerBalanceInsight(domainResult) {
  const performanceDomains = getPerformanceDomains(domainResult?.domains || [])
  const ratedDomains = performanceDomains.filter((d) => Number.isFinite(Number(d?.avg)))

  if (ratedDomains.length < 2) return null

  const max = Math.max(...ratedDomains.map((d) => Number(d.avg)))
  const min = Math.min(...ratedDomains.map((d) => Number(d.avg)))
  const gap = roundTo(max - min, 1)
  const balanceLabel = rankBalanceLabel(gap)

  return buildInsight({
    id: 'player-balance',
    kind: 'profile',
    scope: 'general',
    priority: 88,
    color: gap <= 0.6 ? 'success' : gap <= 1.2 ? 'warning' : 'danger',
    title: 'איזון פרופיל',
    text: `הפרופיל ${balanceLabel}. הפער בין הדומיין החזק לחלש הוא ${fmtScore(gap)}.`,
    meta: {
      gap,
      balanceLabel,
    },
  })
}

function buildPlayerTopAbilitiesInsights(player = {}, limit = 3) {
  const values = getPlayerAbilities(player)
  const abilityMetaMap = getAbilityMetaMap()

  const rated = Object.entries(values)
    .map(([id, value]) => {
      const meta = abilityMetaMap.get(id)
      if (!meta) return null
      if (!isRated(value)) return null

      return {
        id,
        label: meta.label,
        domain: meta.domain,
        domainLabel: meta.domainLabel,
        value: Number(value),
      }
    })
    .filter(Boolean)
    .sort((a, b) => Number(b.value) - Number(a.value))

  if (!rated.length) return []

  const top = rated.slice(0, limit)
  const bottom = [...rated].reverse().slice(0, limit)

  return [
    buildInsight({
      id: 'player-top-abilities',
      kind: 'strength',
      scope: 'abilities',
      priority: 87,
      color: 'success',
      title: 'יכולות בולטות',
      text: top.map((item) => `${item.label} ${fmtScore(item.value)}`).join(' · '),
      meta: top,
    }),
    buildInsight({
      id: 'player-bottom-abilities',
      kind: 'gap',
      scope: 'abilities',
      priority: 86,
      color: 'warning',
      title: 'יכולות לחיזוק',
      text: bottom.map((item) => `${item.label} ${fmtScore(item.value)}`).join(' · '),
      meta: bottom,
    }),
  ]
}

function buildPlayerPotentialInsight(player = {}) {
  const level = Number(player?.level)
  const levelPotential = Number(player?.levelPotential)

  if (!Number.isFinite(level) || !Number.isFinite(levelPotential)) return null

  const gap = roundTo(levelPotential - level, 1)
  let title = 'מימוש פוטנציאל'
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
    priority: 85,
    color,
    title,
    text,
    meta: {
      level,
      levelPotential,
      gap,
    },
  })
}

function buildPlayerDomainCoverageInsights(eligibility) {
  const domains = eligibility?.domains || []

  return domains.map((domain) => {
    if (domain?.isDevelopment) {
      return buildInsight({
        id: `coverage-${domain.domain}`,
        kind: 'coverage',
        scope: 'domain',
        priority: 40,
        color: domain?.isDocumented ? 'success' : 'warning',
        title: `תיעוד ${domain?.domainLabel}`,
        text: domain?.isDocumented
          ? 'דומיין ההתפתחות מתועד.'
          : 'דומיין ההתפתחות עדיין חסר.',
        meta: domain,
      })
    }

    return buildInsight({
      id: `coverage-${domain.domain}`,
      kind: 'coverage',
      scope: 'domain',
      priority: 40,
      color: domain?.isDocumented ? 'success' : 'warning',
      title: `תיעוד ${domain?.domainLabel}`,
      text: `כיסוי של ${domain?.coveragePct || 0}% בדומיין ${domain?.domainLabel}.`,
      meta: domain,
    })
  })
}

export function resolvePlayerAbilitiesInsights(player = {}, options = {}) {
  const eligibility = resolvePlayerAbilitiesInsightsEligibility(player, options)
  const domainResult = resolveAbilitiesDomain(player)

  const readiness = buildPlayerReadinessInsight(eligibility)
  const coverageInsights = buildPlayerDomainCoverageInsights(eligibility)

  if (!eligibility?.isEligible) {
    return {
      isEligible: false,
      eligibility,
      summary: domainResult?.summary || null,
      insights: [readiness, ...coverageInsights].sort((a, b) => b.priority - a.priority),
    }
  }

  const insights = [
    readiness,
    ...buildPlayerStrengthWeaknessInsights(domainResult),
    buildPlayerBalanceInsight(domainResult),
    ...buildPlayerTopAbilitiesInsights(player),
    buildPlayerPotentialInsight(player),
    ...coverageInsights,
  ].filter(Boolean)

  return {
    isEligible: true,
    eligibility,
    summary: domainResult?.summary || null,
    insights: insights.sort((a, b) => b.priority - a.priority),
    domains: domainResult?.domains || [],
  }
}

function buildTeamIdentityInsights(teamDomainResult) {
  const performanceDomains = getPerformanceDomains(teamDomainResult?.domains || [])
  const ratedDomains = performanceDomains.filter((d) => Number.isFinite(Number(d?.avg)))

  if (!ratedDomains.length) return []

  const strongest = ratedDomains.reduce((a, b) => (Number(a.avg) >= Number(b.avg) ? a : b))
  const weakest = ratedDomains.reduce((a, b) => (Number(a.avg) <= Number(b.avg) ? a : b))

  return [
    buildInsight({
      id: 'team-identity',
      kind: 'identity',
      scope: 'general',
      priority: 90,
      color: scoreToColor(strongest?.avg),
      title: 'זהות הקבוצה',
      text: `הזהות הבולטת של הקבוצה היא ${strongest?.domainLabel} עם ממוצע ${fmtScore(strongest?.avg)}.`,
      meta: strongest,
    }),
    buildInsight({
      id: 'team-main-gap',
      kind: 'gap',
      scope: 'general',
      priority: 89,
      color: scoreToColor(weakest?.avg),
      title: 'החולשה המרכזית',
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
    scope: 'general',
    priority: 88,
    color: pct >= 75 ? 'success' : pct >= 60 ? 'primary' : 'warning',
    title: 'עומק תיעוד בסגל',
    text: `${eligible} מתוך ${total} שחקנים עומדים בתנאי הסף, שהם ${pct}% מהסגל.`,
    meta: {
      eligiblePlayersCount: eligible,
      playersCount: total,
      eligiblePct: pct,
    },
  })
}

function buildTeamTopAbilitiesInsights(teamDomainResult, limit = 5) {
  const allItems = (teamDomainResult?.domains || [])
    .flatMap((domain) =>
      (domain?.items || []).map((item) => ({
        ...item,
        domain: domain?.domain,
        domainLabel: domain?.domainLabel,
        value: item?.avg ?? item?.value ?? null,
      }))
    )
    .filter((item) => isRated(item?.value))

  if (!allItems.length) return []

  const top = getTopItems(allItems, limit, 'desc')
  const bottom = getTopItems(allItems, limit, 'asc')

  return [
    buildInsight({
      id: 'team-top-abilities',
      kind: 'strength',
      scope: 'abilities',
      priority: 87,
      color: 'success',
      title: 'יכולות קבוצתיות בולטות',
      text: top.map((item) => `${item.label} ${fmtScore(item.value)}`).join(' · '),
      meta: top,
    }),
    buildInsight({
      id: 'team-bottom-abilities',
      kind: 'gap',
      scope: 'abilities',
      priority: 86,
      color: 'warning',
      title: 'יכולות קבוצתיות לחיזוק',
      text: bottom.map((item) => `${item.label} ${fmtScore(item.value)}`).join(' · '),
      meta: bottom,
    }),
  ]
}

function buildTeamCoverageInsights(teamEligibility) {
  const eligiblePlayers = teamEligibility?.eligiblePlayers || []

  const domainStats = new Map()

  for (const item of eligiblePlayers) {
    for (const domain of item?.domains || []) {
      if (!domainStats.has(domain.domain)) {
        domainStats.set(domain.domain, {
          domain: domain.domain,
          domainLabel: domain.domainLabel,
          documented: 0,
          total: 0,
          isDevelopment: domain.isDevelopment,
        })
      }

      const acc = domainStats.get(domain.domain)
      acc.total += 1
      if (domain.isDocumented) acc.documented += 1
    }
  }

  return Array.from(domainStats.values()).map((item) => {
    const pct = item.total > 0 ? roundTo((item.documented / item.total) * 100, 0) : 0

    return buildInsight({
      id: `team-domain-coverage-${item.domain}`,
      kind: 'coverage',
      scope: 'domain',
      priority: 40,
      color: pct >= 80 ? 'success' : pct >= 60 ? 'primary' : 'warning',
      title: `כיסוי ${item.domainLabel}`,
      text: `${pct}% מהשחקנים הזכאים מתועדים בדומיין ${item.domainLabel}.`,
      meta: {
        ...item,
        documentedPct: pct,
      },
    })
  })
}

function buildTeamMissingPlayersInsight(teamEligibility) {
  const players = (teamEligibility?.ineligiblePlayers || []).slice(0, 5)

  if (!players.length) return null

  return buildInsight({
    id: 'team-missing-players',
    kind: 'coverage',
    scope: 'players',
    priority: 70,
    color: 'warning',
    title: 'שחקנים שחוסמים עומק תיעוד',
    text: players.map((p) => p.playerName).join(' · '),
    meta: players,
  })
}

export function resolveTeamAbilitiesInsights(entity = {}, context = {}, options = {}) {
  const teamEligibility = resolveTeamAbilitiesInsightsEligibility(entity, context, options)
  const teamDomainResult = resolveTeamAbilitiesDomain(entity, context)

  const readiness = buildTeamReadinessInsight(teamEligibility)
  const coverageInsights = buildTeamCoverageInsights(teamEligibility)

  if (!teamEligibility?.isEligible) {
    return {
      isEligible: false,
      eligibility: teamEligibility,
      summary: teamDomainResult?.summary || null,
      insights: [
        readiness,
        buildTeamMissingPlayersInsight(teamEligibility),
        ...coverageInsights,
      ]
        .filter(Boolean)
        .sort((a, b) => b.priority - a.priority),
    }
  }

  const insights = [
    readiness,
    ...buildTeamIdentityInsights(teamDomainResult),
    buildTeamDepthInsight(teamEligibility),
    ...buildTeamTopAbilitiesInsights(teamDomainResult),
    buildTeamMissingPlayersInsight(teamEligibility),
    ...coverageInsights,
  ].filter(Boolean)

  return {
    isEligible: true,
    eligibility: teamEligibility,
    summary: teamDomainResult?.summary || null,
    insights: insights.sort((a, b) => b.priority - a.priority),
    domains: teamDomainResult?.domains || [],
    players: teamDomainResult?.players || [],
  }
}
