// src/shared/stats/engine/gameStats.rates.js

import { statsParm } from '../statsParmList.js'
import { n } from '../stats.helpers.js'

const isRateField = item => String(item?.id || '').endsWith('Rate')
const isTotalField = item => /(?:Total|Attempts)$/.test(String(item?.id || ''))

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
    const success = items.find(item => item?.id !== total?.id && item?.id !== rate?.id)

    return {
      group: items[0]?.tripletGroup,
      totalKey: total?.id || '',
      successKey: success?.id || '',
      rateKey: rate?.id || '',
    }
  })
}

const TRIPLETS = buildTripletGroups()

export function applyStatsRates(stats = {}) {
  const next = { ...stats }

  for (const t of TRIPLETS) {
    if (!t.totalKey || !t.successKey || !t.rateKey) continue

    const total = n(next[t.totalKey])
    const success = n(next[t.successKey])

    next[t.rateKey] = total > 0
      ? Number(((success / total) * 100).toFixed(1))
      : 0
  }

  return next
}
