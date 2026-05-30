// src/features/coreData/resolvers/builders/advancedStats.builder.js

import { statsParm } from '../../../../shared/stats/statsParmList.js'

export const EXCLUDED_ADVANCED_STATS_IDS = new Set([
  'isStarting',
  'goals',
  'assists',
  'position',
  'timePlayed',
  'timeVideoStats',
])

const safeArr = value => {
  return Array.isArray(value) ? value : []
}

const safeNum = value => {
  const num = Number(value)

  return Number.isFinite(num) ? num : 0
}

const isNilValue = value => {
  return value === null || value === undefined || value === ''
}

const hasOwn = (entity, key) => {
  return Object.prototype.hasOwnProperty.call(entity || {}, key)
}

const statFieldIds = statsParm
  .map(item => item?.id)
  .filter(Boolean)
  .filter(id => !EXCLUDED_ADVANCED_STATS_IDS.has(id))

const metaFieldIds = [
  'gamesWithStats',
  'playersWithStats',
  'timePlayed',
  'timeVideoStats',
]

const refFieldIds = [
  'statsGameRefs',
]

const hasStatValue = (entity, key) => {
  if (!hasOwn(entity, key)) return false

  const value = entity[key]
  if (isNilValue(value)) return false

  const num = Number(value)
  if (Number.isFinite(num)) return num > 0

  if (typeof value === 'boolean') return value === true

  return String(value).trim() !== ''
}

const hasMetaValue = (entity, key) => {
  if (!hasOwn(entity, key)) return false

  const value = entity[key]
  if (isNilValue(value)) return false

  const num = Number(value)

  return Number.isFinite(num) && num > 0
}

const pickStats = entity => {
  return statFieldIds.reduce((acc, key) => {
    if (!hasStatValue(entity, key)) return acc

    return {
      ...acc,
      [key]: entity[key],
    }
  }, {})
}

const pickMeta = entity => {
  return metaFieldIds.reduce((acc, key) => {
    if (!hasMetaValue(entity, key)) return acc

    return {
      ...acc,
      [key]: safeNum(entity[key]),
    }
  }, {})
}

const pickRefs = entity => {
  return refFieldIds.reduce((acc, key) => {
    const value = entity[key]
    if (!Array.isArray(value) || !value.length) return acc

    return {
      ...acc,
      [key]: value,
    }
  }, {})
}

const countStatsFields = stats => {
  return Object.keys(stats || {}).length
}

const countRefs = refs => {
  return safeArr(refs?.statsGameRefs).length
}

const hasAdvancedStats = ({ meta, refs, stats }) => {
  if (countStatsFields(stats) > 0) return true
  if (countRefs(refs) > 0) return true
  if (safeNum(meta?.gamesWithStats) > 0) return true
  if (safeNum(meta?.playersWithStats) > 0) return true

  return false
}

const buildSource = type => {
  return {
    kind: 'aggregate',
    type,
    updatedFrom: type === 'team'
      ? 'teamsStats'
      : 'playersStats',
  }
}

export const buildAdvancedStatsState = (entity = {}, type = 'player') => {
  const stats = pickStats(entity)
  const meta = pickMeta(entity)
  const refs = pickRefs(entity)

  const hasStats = hasAdvancedStats({
    meta,
    refs,
    stats,
  })

  return {
    hasStats,

    gamesWithStats: safeNum(meta.gamesWithStats),
    playersWithStats: type === 'team'
      ? safeNum(meta.playersWithStats)
      : 0,

    timePlayed: safeNum(meta.timePlayed),
    timeVideoStats: safeNum(meta.timeVideoStats),

    statsGameRefs: safeArr(refs.statsGameRefs),

    stats,

    summary: {
      statsFieldsCount: countStatsFields(stats),
      refsCount: countRefs(refs),
    },

    source: buildSource(type),
  }
}
