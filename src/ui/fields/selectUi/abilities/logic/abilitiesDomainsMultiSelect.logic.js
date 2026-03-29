//  ui/fields/selectUi/abilities/logic/abilitiesDomainsMultiSelect.logic.js

import { abilitiesList } from '../../../../../shared/abilities/abilities.list.js'

export function buildAbilitiesDomainOptions(list = abilitiesList) {
  const map = new Map()

  for (const item of Array.isArray(list) ? list : []) {
    const domainId = String(item?.domain || '').trim()
    if (!domainId) continue

    if (!map.has(domainId)) {
      map.set(domainId, {
        id: domainId,
        value: domainId,
        label: String(item?.domainLabel || item?.domain || '').trim(),
      })
    }
  }

  return Array.from(map.values())
}

export function normalizeAbilitiesDomainsValue(value) {
  if (!Array.isArray(value)) return []

  const seen = new Set()
  const next = []

  for (const item of value) {
    const id = String(item || '').trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    next.push(id)
  }

  return next
}

export function buildAbilitiesDomainsOptions(options) {
  const source = Array.isArray(options) && options.length ? options : buildAbilitiesDomainOptions()

  const seen = new Set()
  const next = []

  for (const item of source) {
    const id = String(item?.id || item?.value || '').trim()
    if (!id || seen.has(id)) continue

    seen.add(id)
    next.push({
      id,
      value: id,
      label: String(item?.label || id).trim(),
    })
  }

  return next
}

export function buildSelectedDomainsMap(value = []) {
  const normalized = normalizeAbilitiesDomainsValue(value)
  return normalized.reduce((acc, id) => {
    acc[id] = true
    return acc
  }, {})
}

export function buildAbilitiesDomainsRenderLabel(value = [], options = []) {
  const normalizedValue = normalizeAbilitiesDomainsValue(value)
  if (!normalizedValue.length) return ''

  const optionsMap = new Map(
    buildAbilitiesDomainsOptions(options).map((item) => [item.value, item.label])
  )

  return normalizedValue.map((id) => optionsMap.get(id) || id).join(', ')
}

export function toggleAbilitiesDomain(value = [], domainId) {
  const normalized = normalizeAbilitiesDomainsValue(value)
  const nextId = String(domainId || '').trim()
  if (!nextId) return normalized

  if (normalized.includes(nextId)) {
    return normalized.filter((id) => id !== nextId)
  }

  return [...normalized, nextId]
}
