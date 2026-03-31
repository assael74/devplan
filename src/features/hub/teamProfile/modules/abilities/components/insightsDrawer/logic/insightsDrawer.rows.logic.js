//   hub/teamProfile/modules/abilities/components/insightsDrawer/logic/insightsDrawer.rows.logic.js

import {
  fmtScore,
  getAbilityGapHex,
  getAbilityScoreHex,
  getAbilitySemanticHex,
} from '../../../../../../../../shared/abilities/abilities.utils.js'

const FALLBACK_ICON_BY_KIND = {
  readiness: 'readiness',
  identity: 'profile',
  gap: 'warning',
  depth: 'group',
  coverage: 'filter',
  metric: 'insights',
  ranking: 'group',
  distribution: 'category',
  domain: 'abilities',
}

export function toNum(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : NaN
}

export function toPct(v) {
  const n = Number(v)
  return Number.isFinite(n) ? `${Math.round(n)}%` : '—'
}

export function toScore(v) {
  const n = Number(v)
  return Number.isFinite(n) ? fmtScore(n) : '—'
}

export function toPlayersBasedText(included = 0, total = 0, label = 'שחקנים') {
  const safeIncluded = Number(included || 0)
  const safeTotal = Number(total || 0)
  return `מבוסס על ${safeIncluded} מתוך ${safeTotal} ${label}`
}

export function getInsightIcon(insight = {}) {
  if (insight?.idIcon) return insight.idIcon

  return insight?.meta?.domain || insight?.meta?.domainLabel
    ? 'abilities'
    : FALLBACK_ICON_BY_KIND[insight?.kind] || 'insights'
}

export function getMetricEndText(insight = {}) {
  const meta = insight?.meta || {}

  if (insight?.id === 'team-potential-gap') {
    const value = toNum(insight?.value)
    return Number.isFinite(value) ? `${value > 0 ? '+' : ''}${fmtScore(value)}` : ''
  }

  if (insight?.id === 'team-strongest-domain') {
    return Number.isFinite(Number(meta?.avg)) ? fmtScore(meta?.avg) : ''
  }

  if (insight?.id === 'team-biggest-potential-gap-domain') {
    const gap = toNum(meta?.gap)
    return Number.isFinite(gap) ? `+${fmtScore(gap)}` : ''
  }

  if (insight?.id === 'top-ability-contributors' || insight?.id === 'top-potential-contributors') {
    const players = Array.isArray(meta?.players) ? meta.players : []
    return players.length ? `${players.length}` : ''
  }

  if (insight?.id === 'squad-matrix') {
    const eligiblePlayersCount = Number(meta?.eligiblePlayersCount || 0)
    return eligiblePlayersCount ? `${eligiblePlayersCount}` : ''
  }

  return ''
}

export function mapResolveInsightRow(insight = {}) {
  const meta = insight?.meta || {}
  const avg = Number(meta?.avg)
  const pct = Number(meta?.pct)

  const value = Number.isFinite(avg)
    ? fmtScore(avg)
    : Number.isFinite(pct)
      ? `${pct}%`
      : ''

  const accentHex = Number.isFinite(avg)
    ? getAbilityScoreHex(avg)
    : getAbilitySemanticHex(insight?.color)

  const valueHex = Number.isFinite(avg) ? getAbilityScoreHex(avg) : accentHex

  return {
    id: insight?.id,
    title: insight?.title || '',
    value,
    subValue: insight?.text || '',
    icon: getInsightIcon(insight),
    accentHex,
    valueHex,
    endText: '',
    endTextHex: '',
  }
}

export function mapMetricInsightRow(insight = {}) {
  const rawValue = Number(insight?.value)

  const value = Number.isFinite(rawValue) ? fmtScore(rawValue) : insight?.valueLabel || ''

  const valueHex = Number.isFinite(rawValue)
    ? insight?.id === 'team-potential-gap'
      ? getAbilityGapHex(rawValue)
      : getAbilityScoreHex(rawValue)
    : ''

  const accentHex = Number.isFinite(rawValue)
    ? insight?.id === 'team-potential-gap'
      ? getAbilityGapHex(rawValue)
      : getAbilityScoreHex(rawValue)
    : insight?.color || getAbilitySemanticHex('neutral')

  return {
    id: insight?.id,
    title: insight?.title || '',
    value,
    subValue: insight?.interpretation?.text || insight?.shortText || '',
    icon: getInsightIcon(insight),
    accentHex,
    valueHex,
    endText: getMetricEndText(insight),
    endTextHex:
      insight?.id === 'team-potential-gap'
        ? getAbilityGapHex(rawValue)
        : '',
  }
}

export function buildTopStats(team = {}, readinessResult = {}, teamInsightsResult = {}) {
  const readinessSummary = readinessResult?.eligibility?.summary || {}
  const metrics = teamInsightsResult?.metrics || {}

  return [
    {
      id: 'team-level',
      title: 'יכולת קבוצה',
      value: toScore(metrics?.teamLevel?.avg),
      sub: 'הרמה המשוקללת הנוכחית של הסגל',
      icon: 'level',
    },
    {
      id: 'team-potential',
      title: 'פוטנציאל קבוצה',
      value: toScore(metrics?.teamPotential?.avg),
      sub: 'התקרה העתידית המחושבת של הסגל',
      icon: 'potential',
    },
    {
      id: 'eligible-players',
      title: 'שחקנים תקפים',
      value: `${readinessSummary?.eligiblePlayersCount || 0}/${readinessSummary?.playersCount || 0}`,
      sub: 'שחקנים שעומדים בתנאי הסף לתובנות',
      icon: 'group',
    },
    {
      id: 'eligible-pct',
      title: 'כיסוי סגל',
      value: toPct(readinessSummary?.eligiblePct),
      sub: 'אחוז שחקנים תקפים מתוך הסגל',
      icon: 'filter',
    },
  ]
}

export function buildReadinessRows(readinessResult = {}) {
  const allInsights = readinessResult?.insights || []

  return allInsights
    .filter((item) => ['readiness', 'depth', 'coverage'].includes(item?.kind))
    .map(mapResolveInsightRow)
}

export function buildProfileRows(teamInsightsResult = {}) {
  const allInsights = teamInsightsResult?.insights || []

  return allInsights
    .filter((item) =>
      [
        'team-level',
        'team-strongest-domain',
        'top-ability-contributors',
        'squad-matrix',
      ].includes(item?.id)
    )
    .map(mapMetricInsightRow)
}

export function buildPotentialRows(teamInsightsResult = {}) {
  const allInsights = teamInsightsResult?.insights || []

  return allInsights
    .filter((item) =>
      [
        'team-potential',
        'team-potential-gap',
        'top-potential-contributors',
        'team-biggest-potential-gap-domain',
      ].includes(item?.id)
    )
    .map(mapMetricInsightRow)
}

export function buildDomainRows(domains = []) {
  return (domains || [])
    .filter((domain) => domain?.domain !== 'development')
    .map((domain) => {
      const avg = toNum(domain?.avg)
      const potential = toNum(domain?.potentialAvg)
      const gap =
        Number.isFinite(avg) && Number.isFinite(potential)
          ? potential - avg
          : NaN

      return {
        id: domain?.domain,
        title: domain?.domainLabel || domain?.domain || '',
        value: toScore(avg),
        ratingValue: Number.isFinite(avg) ? avg : 0,
        subValue: Number.isFinite(potential)
          ? `פוטנציאל ${toScore(potential)}`
          : 'אין ציון פוטנציאל תקף',
        icon: domain?.domain || 'abilities',
        accentHex: getAbilityScoreHex(avg),
        valueHex: getAbilityScoreHex(avg),
        endText: Number.isFinite(gap) ? `+${fmtScore(gap)}` : '',
        endTextHex: getAbilityGapHex(gap),
        rawAvg: avg,
      }
    })
}
