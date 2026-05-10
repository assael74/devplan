// teamProfile/sharedLogic/games/insightsLogic/viewModel/cards/difficultyCards.model.js

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

function getDifficultyBriefBucket(brief, id) {
  const metrics = brief?.metrics || {}

  if (metrics[id]) return metrics[id]

  const buckets = Array.isArray(metrics.buckets) ? metrics.buckets : []
  const found = buckets.find((bucket) => bucket?.id === id)

  return found || null
}

function getDifficultyActual(item, brief) {
  const bucket = getDifficultyBriefBucket(brief, item?.id)

  if (hasValue(item?.pointsPct)) return toNum(item.pointsPct)
  if (hasValue(bucket?.pointsRate)) return toNum(bucket.pointsRate)

  return 0
}

function getDifficultyTargetRate(item, brief) {
  const bucket = getDifficultyBriefBucket(brief, item?.id)
  const targets = brief?.metrics?.targets || {}

  if (hasValue(bucket?.targetRate)) {
    return toNum(bucket.targetRate, null)
  }

  if (hasValue(bucket?.evaluation?.targetRate)) {
    return toNum(bucket.evaluation.targetRate, null)
  }

  if (hasValue(targets?.[item?.id]?.targetRate)) {
    return toNum(targets[item.id].targetRate, null)
  }

  return null
}

function getDifficultyGap(item, brief) {
  const targetRate = getDifficultyTargetRate(item, brief)

  if (targetRate === null) return null

  return getDifficultyActual(item, brief) - targetRate
}

function getDifficultyColor(item, brief) {
  const bucket = getDifficultyBriefBucket(brief, item?.id)
  const tone = bucket?.evaluation?.tone

  if (tone) return tone

  return item?.color || 'neutral'
}

function getDifficultySub(item, brief) {
  const targetRate = getDifficultyTargetRate(item, brief)
  const gap = getDifficultyGap(item, brief)

  return formatMetricSub({
    targetRate,
    gap,
    fallback: '',
  })
}

function getDifficultyTooltip(item, brief) {
  const actual = getDifficultyActual(item, brief)
  const targetRate = getDifficultyTargetRate(item, brief)

  const rows = buildGameTooltipRows({
    item,
    actual,
    targetRate,
  })

  addReliabilityRow(rows, item, brief)

  return {
    title: item?.label || 'רמת יריבה',
    rows,
  }
}

function addReliabilityRow(rows, item, brief) {
  const reliability = getDifficultyReliability(item, brief)

  if (!reliability) return

  rows.push({
    id: 'reliability',
    label: 'אמינות',
    value: reliability,
  })
}

function getDifficultyReliability(item, brief) {
  const bucket = getDifficultyBriefBucket(brief, item?.id)

  return (
    bucket?.evaluation?.reliability?.label ||
    bucket?.reliability?.label ||
    ''
  )
}

function buildDifficultyCard(item, brief) {
  return {
    id: item.id,
    label: item?.label || 'רמת יריבה',
    value: formatPct(getDifficultyActual(item, brief)),
    sub: getDifficultySub(item, brief),
    icon: item?.icon || 'difficulty',
    color: getDifficultyColor(item, brief),
    tooltip: getDifficultyTooltip(item, brief),
  }
}

function buildDifficultyItems(current) {
  return [current?.easy, current?.equal, current?.hard].filter(Boolean)
}

function buildCurrentEmpty(readiness) {
  return {
    title: 'אין מספיק נתוני רמת יריבה',
    text: readiness?.missing?.join(' · ') || 'חסרים משחקים להצגה',
  }
}

function buildCurrentModel({ data, brief }) {
  const readiness = data?.readiness || {}
  const current = data?.current || {}
  const items = buildDifficultyItems(current)

  return {
    title: 'מצב עד עכשיו',
    chipLabel: 'רמת יריבה',
    chipIcon: 'difficulty',
    chipColor: readiness?.isCurrentReady ? 'primary' : 'neutral',
    isReady: readiness?.isCurrentReady === true,
    empty: buildCurrentEmpty(readiness),
    cards: items.map((item) => buildDifficultyCard(item, brief)),
  }
}

function buildProjectionMissingText(readiness) {
  if (readiness?.missing?.length) {
    return readiness.missing.join(' · ')
  }

  return 'חסר מידע לחישוב תחזית לפי רמת יריבה'
}

function buildProjectionText(projection) {
  const base = projection?.text || ''
  const remaining = projection?.remaining || {}

  const easy = remaining.easy || 0
  const equal = remaining.equal || 0
  const hard = remaining.hard || 0

  const remainingText = `נשארו ${easy} קל · ${equal} שווה · ${hard} קשה`

  if (!base) return remainingText

  return `${base} · ${remainingText}`
}

function buildProjectionModel(data) {
  const projection = data?.projection || {}
  const readiness = data?.readiness || {}
  const isReady = projection?.isReady === true

  return {
    title: 'תחזית רמת יריבה',
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

function buildDifficultyInsightModel({ data, brief }) {
  return buildInsightModel({
    brief,
    data,
    fallbackLabel: 'תובנה',
    fallbackIcon: 'insights',
    fallbackText: 'כאן תוצג תובנה לפי רמת יריבה.',
    resolveColor: resolveInsightColor,
  })
}

export function buildDifficultyCardsModel({ data = {}, brief = {} } = {}) {
  return {
    current: buildCurrentModel({
      data,
      brief,
    }),
    insight: buildDifficultyInsightModel({
      data,
      brief,
    }),
    projection: buildProjectionModel(data),
  }
}
