// playerProfile/sharedLogic/abilities/insightsDrawerLogic/abilitiesInsightsDrawer.logic.js

import { resolvePlayerAbilitiesInsights } from '../../../../../../shared/abilities/insights/abilities.insights.js'
import { resolvePlayerFullName } from '../../../../../../shared/abilities/abilities.resolvers.js'
import {
  fmtScore,
  getAbilityScoreHex,
  getAbilityGapHex,
  getAbilitySemanticHex,
} from '../../../../../../shared/abilities/abilities.utils.js'

const FALLBACK_ICON_BY_KIND = {
  readiness: 'readiness',
  strength: 'strength',
  gap: 'warning',
  potential: 'potential',
  profile: 'profile',
  history: 'calendar',
}

const FALLBACK_SECTION_BY_KIND = {
  readiness: 'readiness',
  history: 'readiness',
  strength: 'profile',
  gap: 'profile',
  profile: 'profile',
  potential: 'potential',
}

function toNum(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : NaN
}

function toPct(v) {
  const n = Number(v)
  return Number.isFinite(n) ? `${Math.round(n)}%` : '—'
}

function toScore(v) {
  const n = Number(v)
  return Number.isFinite(n) ? fmtScore(n) : '—'
}

function getInsightIcon(insight = {}) {
  return insight?.meta?.domain || insight?.meta?.domainLabel
    ? 'abilities'
    : FALLBACK_ICON_BY_KIND[insight?.kind] || 'insights'
}

function getInsightEndText(insight = {}) {
  const meta = insight?.meta || {}

  if (insight?.id === 'player-balance') {
    return meta?.balanceLabel || ''
  }

  if (insight?.id === 'player-potential-gap') {
    const gap = toNum(meta?.gap)
    return Number.isFinite(gap) ? `${fmtScore(gap)}+` : ''
  }

  if (insight?.id === 'player-biggest-potential-gap-domain') {
    const gap = toNum(meta?.gap)
    return Number.isFinite(gap) ? `${fmtScore(gap)}+` : ''
  }

  if (insight?.id === 'player-strongest-domain' || insight?.id === 'player-weakest-domain') {
    return Number.isFinite(Number(meta?.avg)) ? fmtScore(meta?.avg) : ''
  }

  if (insight?.id === 'player-windows') {
    const windowsCount = Number(meta?.windowsCount || 0)
    return windowsCount ? `${windowsCount}` : ''
  }

  return ''
}

function mapInsightRow(insight = {}) {
  const meta = insight?.meta || {}

  const avg = Number(meta?.avg)
  const score = Number(meta?.score)
  const gap = Number(meta?.gap)

  const numericValue = Number.isFinite(avg)
    ? fmtScore(avg)
    : Number.isFinite(score)
      ? fmtScore(score)
      : ''

  const valueHex = Number.isFinite(avg)
    ? getAbilityScoreHex(avg)
    : Number.isFinite(score)
      ? getAbilityScoreHex(score)
      : ''

  const endText = getInsightEndText(insight)
  const endTextHex = Number.isFinite(gap) ? getAbilityGapHex(gap) : ''
  const accentHex =
    Number.isFinite(avg)
      ? getAbilityScoreHex(avg)
      : Number.isFinite(score)
        ? getAbilityScoreHex(score)
        : Number.isFinite(gap)
          ? getAbilityGapHex(gap)
          : getAbilitySemanticHex(insight?.color)

  return {
    id: insight?.id,
    title: insight?.title || '',
    value: numericValue,
    subValue: insight?.text || '',
    icon: getInsightIcon(insight),
    accentHex,
    valueHex,
    endText,
    endTextHex,
  }
}

function buildTopStats(player = {}, insightsResult = {}) {
  const eligibilitySummary = insightsResult?.eligibility?.summary || {}
  const level = toNum(player?.level)
  const levelPotential = toNum(player?.levelPotential)

  return [
    {
      id: 'level',
      title: 'יכולת נוכחית',
      value: toScore(level),
      sub: 'רמת השחקן המחושבת כיום',
      icon: 'level',
    },
    {
      id: 'potential',
      title: 'פוטנציאל',
      value: toScore(levelPotential),
      sub: 'רמת הפוטנציאל המחושבת',
      icon: 'potential',
    },
    {
      id: 'abilityCoverage',
      title: 'כיסוי יכולת',
      value: toPct(eligibilitySummary?.abilityCoverage),
      sub: 'אחוז הדומיינים התקפים ביכולת נוכחית',
      icon: 'filter',
    },
    {
      id: 'potentialCoverage',
      title: 'כיסוי פוטנציאל',
      value: toPct(eligibilitySummary?.potentialCoverage),
      sub: 'אחוז הדומיינים התקפים בפוטנציאל',
      icon: 'potentialCoverage',
    },
  ]
}

function buildDomainsRows(domains = [], player = {}) {
  const potentialMap = player?.domainPotentialScores || {}

  return (domains || [])
    .filter((domain) => domain?.domain !== 'development')
    .map((domain) => {
      const avg = toNum(domain?.avg)
      const potential = toNum(
        domain?.potentialScore ?? potentialMap?.[domain?.domain]
      )
      const gap =
        Number.isFinite(avg) && Number.isFinite(potential)
          ? potential - avg
          : NaN

      return {
        id: domain?.domain,
        title: domain?.domainLabel || domain?.domain || '',
        value: toScore(avg),
        subValue: Number.isFinite(potential)
          ? `פוטנציאל ${toScore(potential)}`
          : 'אין ציון פוטנציאל תקף',
        icon: domain?.domain || 'abilities',
        accentHex: getAbilityScoreHex(avg),
        valueHex: getAbilityScoreHex(avg),
        endText: Number.isFinite(gap) ? `+${fmtScore(gap)}` : '',
        endTextHex: getAbilityGapHex(gap),
      }
    })
}

export function buildPlayerAbilitiesInsightsDrawerModel(player = {}) {
  const insightsResult = resolvePlayerAbilitiesInsights(player)
  const allInsights = insightsResult?.insights || []

  const readinessRows = allInsights
    .filter((item) => FALLBACK_SECTION_BY_KIND[item?.kind] === 'readiness')
    .map(mapInsightRow)

  const profileRows = allInsights
    .filter((item) => FALLBACK_SECTION_BY_KIND[item?.kind] === 'profile')
    .map(mapInsightRow)

  const potentialRows = allInsights
    .filter((item) => FALLBACK_SECTION_BY_KIND[item?.kind] === 'potential')
    .map(mapInsightRow)

  const domainRows = buildDomainsRows(insightsResult?.domains || [], player)

  return {
    playerName: insightsResult?.playerName || resolvePlayerFullName(player) || '',
    isEligible: Boolean(insightsResult?.isEligible),
    topStats: buildTopStats(player, insightsResult),
    readinessRows,
    profileRows,
    potentialRows,
    domainRows,
    raw: insightsResult,
  }
}
