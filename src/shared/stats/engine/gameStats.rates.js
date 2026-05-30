// src/shared/stats/engine/gameStats.rates.js

import { statsParm } from '../statsParmList.js'
import { n } from '../stats.helpers.js'

const isRateField = item => {
  return String(item?.id || '').endsWith('Rate')
}

const isTotalField = item => {
  return /(?:Total|Attempts)$/.test(String(item?.id || ''))
}

const hasOwn = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj || {}, key)
}

const hasPositive = value => {
  return n(value) > 0
}

const buildTripletGroups = () => {
  const map = new Map()

  for (const item of statsParm || []) {
    if (item?.statsParmFieldType !== 'triplet' || !item?.tripletGroup) continue
    if (!map.has(item.tripletGroup)) map.set(item.tripletGroup, [])
    map.get(item.tripletGroup).push(item)
  }

  return Array.from(map.values()).map(items => {
    const total = items.find(isTotalField)
    const rate = items.find(isRateField)
    const success = items.find(item => {
      return item?.id !== total?.id && item?.id !== rate?.id
    })

    return {
      group: items[0]?.tripletGroup,
      totalKey: total?.id || '',
      successKey: success?.id || '',
      rateKey: rate?.id || '',
    }
  })
}

const TRIPLETS = buildTripletGroups()

const shouldCalculateRate = (stats, triplet) => {
  if (!triplet.totalKey || !triplet.successKey || !triplet.rateKey) return false

  return (
    hasOwn(stats, triplet.totalKey) ||
    hasOwn(stats, triplet.successKey)
  )
}

export function applyStatsRates(stats = {}) {
  const next = { ...(stats || {}) }

  for (const t of TRIPLETS) {
    if (!shouldCalculateRate(next, t)) continue

    const total = n(next[t.totalKey])
    const success = n(next[t.successKey])

    if (!hasPositive(total)) {
      delete next[t.rateKey]
      continue
    }

    next[t.rateKey] = Number(((success / total) * 100).toFixed(1))
  }

  return next
}
