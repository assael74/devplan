// src/shared/teams/insights/insights.recommendations.js

import {
  resolveTeamPlayersInsightId,
  TEAM_PLAYERS_INSIGHT_RULES_BY_FAMILY,
} from './insights.rules.js'

import {
  getTeamPlayersInsightType,
} from './insights.types.js'

const emptyArray = []
const emptyObject = {}

const clip = (value, max = 90) => {
  const text = String(value || '')

  return text.length > max
    ? `${text.slice(0, max)}...`
    : text
}

const recommendationRules =
  TEAM_PLAYERS_INSIGHT_RULES_BY_FAMILY.recommendation || emptyArray

const toNum = value => {
  const n = Number(value)

  return Number.isFinite(n) ? n : 0
}

const arr = value => {
  return Array.isArray(value) ? value : emptyArray
}

const signed = value => {
  const n = Number(value)

  if (!Number.isFinite(n) || n === 0) return '0'

  return n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2)
}

const getTone = group => {
  return group?.diagnosis?.displayTone ||
    group?.diagnosis?.color ||
    group?.diagnosis?.groupTone ||
    group?.diagnosis?.riskTone ||
    group?.diagnosis?.qualityTone ||
    group?.scoreTone ||
    'neutral'
}

const getPriority = typeId => {
  const rule = recommendationRules.find(item => item.id === typeId)

  return rule?.priority || 0
}

const getGroupTextLabel = group => {
  const label = getGroupLabel(group)

  const map = {
    'שחקן מפתח': 'קבוצת שחקני המפתח',
    'שחקן מרכזי': 'קבוצת השחקנים המרכזיים',
    'רוטציה': 'קבוצת שחקני הרוטציה',
    'אחרון בסגל': 'קבוצת קצה הסגל',
  }

  return map[label] || label
}

const getContext = ({ group, aspectId, mode, }) => {
  return {
    aspectId,
    mode,

    roleId: group?.roleId,
    groupId: group?.id,
    groupLabel: group?.label,

    score: group?.score,
    qualityLevel: group?.diagnosis?.qualityLevel,
    riskLevel: group?.diagnosis?.riskLevel,

    sampleLevel: group?.sample?.reliability,
    sample: group?.sample || emptyObject,
    health: group?.health || emptyObject,
    metrics: group?.metrics || emptyObject,

    structureStatus: group?.rangeStatus || group?.status,
  }
}

const getMetrics = group => {
  return {
    score: group?.score ?? null,
    scoreLabel: group?.scoreLabel || '-',

    checked: toNum(group?.sample?.checked),
    players: toNum(group?.sample?.players),

    weakCount: toNum(group?.health?.weakCount),
    weakRate: toNum(group?.health?.weakRate),
    damageScore: toNum(group?.health?.damageScore),
    weakWeightedTva: toNum(group?.health?.weakWeightedTva),

    totalTva: toNum(group?.metrics?.totalTva),
  }
}

const getSource = ({ group, aspectId, mode, }) => {
  return {
    aspectId,
    mode: mode || null,
    groupId: group?.id,
    groupLabel: group?.label,
    layerKey: group?.layerKey || '',
    layerLabel: group?.layerLabel || '',
  }
}

const getPlayers = group => {
  return {
    problem: arr(group?.weakPlayers),
    ok: arr(group?.players).filter(player => !player.isWeak),
    all: arr(group?.players),
  }
}

const getGroupLabel = group => {
  return group?.label || 'קבוצת השחקנים'
}

const getProblemRatio = metrics => {
  return `${metrics.weakCount}/${metrics.checked || metrics.players || 0}`
}

const isEmptyGroup = group => {
  const players = toNum(group?.sample?.players)
  const checked = toNum(group?.sample?.checked)

  return !players && !checked
}

const isNoiseGroup = group => {
  return (
    !group ||
    group.id === 'none' ||
    group.id === 'unassigned' ||
    isEmptyGroup(group)
  )
}

const isWeakRecommendation = item => {
  return (
    item?.typeId === 'completeMissingSample' &&
    item?.metrics?.players <= 1
  )
}

const shouldSkipRecommendationGroup = group => {
  return isNoiseGroup(group)
}

const shouldKeepRecommendation = item => {
  return !isWeakRecommendation(item)
}

const recommendationTextBuilders = {
  completeMissingSample: ({
    group,
  }) => {
    return `אין מספיק מדגם עבור ${getGroupTextLabel(group)}. מומלץ להמתין לעוד דקות משחק או להגדיל את בסיס הנתונים לפני קבלת החלטה מקצועית.`
  },

  replaceWeakKeyPlayer: ({
    group,
    metrics,
  }) => {
    return `${getGroupTextLabel(group)} כוללת ${getProblemRatio(metrics)} שחקנים מתחת לציפייה. במעמד הזה גם חריגה נקודתית יכולה להשפיע על הקבוצה, ולכן מומלץ לבדוק מי מושך את התפקוד למטה והאם נדרש שינוי בתפקיד, בדקות או בהיררכיה.`
  },

  strengthenPosition: ({
    group,
    metrics,
  }) => {
    return `${getGroupTextLabel(group)} מציגה ביצוע נמוך או סיכון מקצועי. הציון הוא ${metrics.scoreLabel}, עם ${getProblemRatio(metrics)} שחקנים מתחת לציפייה. מומלץ לבחון חיזוק, שינוי תפקידים או הגדלת כיסוי בעמדה.`
  },

  reducePositionLoad: ({
    group,
  }) => {
    return `${getGroupTextLabel(group)} נראית עמוסה או לא מאוזנת. מומלץ לבדוק האם יש ריבוי שחקנים באותה קבוצה, האם חלקם יכולים לתת כיסוי אחר, או האם נדרש לדייק את חלוקת התפקידים.`
  },

  reduceMinutesForDamagingPlayer: ({
    group,
    metrics,
  }) => {
    return `${getGroupTextLabel(group)} מייצרת נזק מצטבר של ${signed(metrics.weakWeightedTva)} ומדד השפעה כולל של ${signed(metrics.totalTva)}. מומלץ לבדוק את חלוקת הדקות של השחקנים הלא תקינים ולהפחית דקות לשחקנים שפוגעים בתפקוד.`
  },

  increaseMinutesForStablePlayer: ({
    group,
    metrics,
  }) => {
    return `${getGroupTextLabel(group)} מציגה ביצוע חיובי עם ציון ${metrics.scoreLabel} ומדד השפעה ${signed(metrics.totalTva)}. מומלץ לבדוק אם יש שחקנים יציבים שאפשר להגדיל להם דקות או אחריות.`
  },

  adjustPlayerRole: ({
    group,
  }) => {
    return `${getGroupTextLabel(group)} לא מתפקדת בהתאם לציפייה מהמעמד שהוגדר. מומלץ לבדוק האם הגדרת המעמד של חלק מהשחקנים מדויקת, או האם נדרש לעדכן את ההיררכיה המקצועית.`
  },
}

const buildText = ({ type, group, metrics, players, }) => {
  const builder = recommendationTextBuilders[type.id]

  if (typeof builder === 'function') {
    return builder({
      type,
      group,
      metrics,
      players,
    })
  }

  return `${type.description} מקור: ${getGroupTextLabel(group)}.`
}

const buildRecommendation = ({ typeId, group, aspectId, mode, }) => {
  const type = getTeamPlayersInsightType(typeId)
  const metrics = getMetrics(group)
  const players = getPlayers(group)

  return {
    id: `${typeId}-${aspectId}-${mode || 'base'}-${group?.id}`,
    typeId,
    family: 'recommendation',

    title: type.label,
    text: buildText({
      type,
      group,
      metrics,
      players,
    }),
    description: type.description,

    priority: getPriority(typeId),
    tone: getTone(group),

    source: getSource({
      group,
      aspectId,
      mode,
    }),

    metrics,
    players,
  }
}

const buildGroupRecommendation = ({ group, aspectId, mode, }) => {
  if (shouldSkipRecommendationGroup(group)) return null

  const context = getContext({
    group,
    aspectId,
    mode,
  })

  const typeId = resolveTeamPlayersInsightId({
    family: 'recommendation',
    context,
    fallback: null,
  })

  if (!typeId) return null

  return buildRecommendation({
    typeId,
    group,
    aspectId,
    mode,
  })
}

const collectAspectGroups = aspect => {
  if (!aspect) return emptyArray

  if (aspect.modes) {
    return Object.values(aspect.modes).flatMap(mode => {
      return arr(mode?.groups).map(group => ({
        group,
        aspectId: aspect.id,
        mode: mode.mode || mode.id,
      }))
    })
  }

  return arr(aspect.groups).map(group => ({
    group,
    aspectId: aspect.id,
    mode: null,
  }))
}

const dedupeRecommendations = items => {
  const map = new Map()

  items.forEach(item => {
    const key = [
      item.typeId,
      item.source.aspectId,
      item.source.mode,
      item.source.groupId,
    ].join('|')

    const current = map.get(key)

    if (!current || item.priority > current.priority) {
      map.set(key, item)
    }
  })

  return Array.from(map.values())
}

const sortRecommendations = items => {
  return [...items].sort((a, b) => b.priority - a.priority)
}

export const printRecommendationsTextDebug = recommendations => {
  const items = Array.isArray(recommendations?.items)
    ? recommendations.items
    : Array.isArray(recommendations)
      ? recommendations
      : emptyArray

  console.group('RECOMMENDATIONS TEXT DEBUG')

  console.table(items.map(item => ({
    typeId: item.typeId,
    title: item.title,
    source: item.source?.groupLabel,
    aspect: item.source?.aspectId,
    mode: item.source?.mode || '',
    tone: item.tone,
    priority: item.priority,
    score: item.metrics?.scoreLabel,
    weak: `${item.metrics?.weakCount || 0}/${item.metrics?.checked || item.metrics?.players || 0}`,
    מדד_השפעה: item.metrics?.totalTva,
    damage: item.metrics?.damageScore,
    text: clip(item.text),
  })))

  console.groupEnd()
}

export const printRecommendationsFullTextDebug = recommendations => {
  const items = Array.isArray(recommendations?.items)
    ? recommendations.items
    : Array.isArray(recommendations)
      ? recommendations
      : emptyArray

  console.group('RECOMMENDATIONS FULL TEXT')

  items.forEach((item, index) => {
    console.groupCollapsed(
      `${index + 1}. ${item.title} | ${item.source?.groupLabel || ''} | ${item.typeId}`
    )

    console.log('typeId:', item.typeId)
    console.log('title:', item.title)
    console.log('source:', item.source)
    console.log('metrics:', item.metrics)
    console.log('description:', item.description)
    console.log('text:', item.text)

    console.groupEnd()
  })

  console.groupEnd()
}

const getRecommendationsStatus = recommendations => {
  const danger = recommendations.filter(item => item.tone === 'danger').length
  const warning = recommendations.filter(item => item.tone === 'warning').length

  if (danger) {
    return {
      label: `${danger} קריטיות`,
      color: 'danger',
    }
  }

  if (warning) {
    return {
      label: `${warning} לבדיקה`,
      color: 'warning',
    }
  }

  if (recommendations.length) {
    return {
      label: `${recommendations.length} המלצות`,
      color: 'primary',
    }
  }

  return {
    label: 'אין פעולה',
    color: 'neutral',
  }
}

export const buildTeamInsightRecommendations = ({ model, limit = 8, } = {}) => {
  const aspects = model?.aspects || emptyObject

  const items = Object.values(aspects)
    .flatMap(collectAspectGroups)
    .map(buildGroupRecommendation)
    .filter(Boolean)

  const recommendations = sortRecommendations(
    dedupeRecommendations(items).filter(shouldKeepRecommendation)
  ).slice(0, limit)

  return {
    id: 'recommendations',
    title: 'המלצות',
    icon: 'insights',
    status: getRecommendationsStatus(recommendations),
    items: recommendations,
    summary: {
      total: recommendations.length,
      danger: recommendations.filter(item => item.tone === 'danger').length,
      warning: recommendations.filter(item => item.tone === 'warning').length,
    },
  }
}
