// teamProfile/sharedLogic/games/insightsLogic/viewModel/cards/homeAwayCards.model.js

import {
  buildGameTooltipRows,
} from '../tooltips/index.js'

import {
  buildInsightModel,
  formatMetricSub,
  formatPct,
  hasValue,
  resolveInsightColor,
  toNum,
} from '../common/index.js'

function getVenueEvaluation(brief, key) {
  const evaluation = brief?.metrics?.evaluation || {}
  return evaluation[key] || null
}

function getVenueTargets(brief, key) {
  const targets = brief?.metrics?.targets || {}
  return targets[key] || null
}

function getVenueTargetRate(brief, key) {
  const target = getVenueTargets(brief, key)

  if (hasValue(target?.greenMin)) {
    return toNum(target.greenMin, null)
  }

  if (hasValue(target?.targetRate)) {
    return toNum(target.targetRate, null)
  }

  return null
}

function getVenueLabel(item, type) {
  if (item?.label) return item.label
  if (type === 'home') return 'בית'

  return 'חוץ'
}

function getVenueIcon(type) {
  if (type === 'home') return 'home'
  return 'away'
}

function getVenueColor(item, brief, type) {
  const evaluation = getVenueEvaluation(brief, type)
  const tone = evaluation?.tone

  if (tone) return tone

  return item?.color || 'neutral'
}

function getVenueActual(item) {
  return toNum(item?.pointsPct)
}

function getVenueGap(item, brief, type) {
  const targetRate = getVenueTargetRate(brief, type)

  if (targetRate === null) return null

  return getVenueActual(item) - targetRate
}

function getVenueSub(item, brief, type) {
  const targetRate = getVenueTargetRate(brief, type)
  const gap = getVenueGap(item, brief, type)

  return formatMetricSub({
    targetRate,
    gap,
    fallback: '',
  })
}

function buildVenueTooltip(item, brief, type) {
  const actual = getVenueActual(item)
  const targetRate = getVenueTargetRate(brief, type)

  return {
    title: getVenueLabel(item, type),
    rows: buildGameTooltipRows({
      item,
      actual,
      targetRate,
    }),
  }
}

function buildVenueCard({ item, brief, type }) {
  return {
    id: type,
    label: getVenueLabel(item, type),
    value: formatPct(getVenueActual(item)),
    sub: getVenueSub(item, brief, type),
    icon: getVenueIcon(type),
    color: getVenueColor(item, brief, type),
    tooltip: buildVenueTooltip(item, brief, type),
  }
}

function buildCurrentEmpty(readiness) {
  return {
    title: 'אין מספיק נתוני בית / חוץ',
    text: readiness?.missing?.join(' · ') || 'חסרים משחקים להצגה',
  }
}

function buildCurrentModel({ data, brief }) {
  const readiness = data?.readiness || {}
  const home = data?.current?.home || {}
  const away = data?.current?.away || {}

  return {
    title: 'מצב עד עכשיו',
    chipLabel: 'בית / חוץ',
    chipIcon: 'home',
    chipColor: readiness?.isCurrentReady ? 'primary' : 'neutral',
    isReady: readiness?.isCurrentReady === true,
    empty: buildCurrentEmpty(readiness),
    cards: [
      buildVenueCard({
        item: home,
        brief,
        type: 'home',
      }),
      buildVenueCard({
        item: away,
        brief,
        type: 'away',
      }),
    ],
  }
}

function buildProjectionMissingText(readiness) {
  if (readiness?.missing?.length) {
    return readiness.missing.join(' · ')
  }

  return 'חסר מידע לחישוב תחזית לפי בית / חוץ'
}

function buildProjectionText(projection) {
  const base = projection?.text || ''
  const home = projection?.remainingHomeGames || 0
  const away = projection?.remainingAwayGames || 0
  const remaining = `נשארו ${home} בית · ${away} חוץ`

  if (!base) return remaining

  return `${base} · ${remaining}`
}

function buildProjectionModel(data) {
  const projection = data?.projection || {}
  const readiness = data?.readiness || {}
  const isReady = projection?.isReady === true

  return {
    title: 'תחזית בית / חוץ',
    chipLabel: isReady ? 'מוכן' : 'חסר מידע',
    chipIcon: 'projection',
    chipColor: isReady ? projection?.color || 'neutral' : 'neutral',
    color: projection?.color || 'neutral',
    isReady,
    value: projection?.level?.rankRangeLabel || projection?.title || '—',
    sub: buildProjectionText(projection),
    empty: {
      title: 'תחזית לא זמינה',
      text: buildProjectionMissingText(readiness),
    },
  }
}

function buildHomeAwayInsightModel({ data, brief }) {
  return buildInsightModel({
    brief,
    data,
    fallbackLabel: 'תובנה',
    fallbackIcon: 'insights',
    fallbackText: 'כאן תוצג תובנה על פערי בית וחוץ.',
    resolveColor: resolveInsightColor,
  })
}

export function buildHomeAwayCardsModel({ data = {}, brief = {} } = {}) {
  return {
    current: buildCurrentModel({
      data,
      brief,
    }),
    insight: buildHomeAwayInsightModel({
      data,
      brief,
    }),
    projection: buildProjectionModel(data),
  }
}
