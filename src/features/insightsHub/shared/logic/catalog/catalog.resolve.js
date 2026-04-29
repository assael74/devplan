// features/insightsHub/shared/logic/catalog/catalog.resolve.js

import { CATALOG_LABELS } from './catalog.labels.js'

export function getCatalogItemsByIds(items, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return []

  const map = new Map(
    Array.isArray(items)
      ? items.map((item) => [item.id, item])
      : []
  )

  return ids
    .map((id) => map.get(id))
    .filter(Boolean)
}

export function getCatalogItemsByGroups(items, groups) {
  if (!Array.isArray(groups) || groups.length === 0) return []

  return Array.isArray(items)
    ? items.filter((item) => groups.includes(item.group))
    : []
}

export function excludeCatalogItems(items, excludeIds) {
  if (!Array.isArray(excludeIds) || excludeIds.length === 0) return items

  const excluded = new Set(excludeIds)
  return items.filter((item) => !excluded.has(item.id))
}

export function resolveCatalogViewItems(items, group, type) {
  const idsKeyByType = {
    facts: 'factIds',
    metrics: 'metricIds',
    benchmarks: 'benchmarkIds',
  }

  const groupsKeyByType = {
    facts: 'factGroups',
    metrics: 'metricGroups',
    benchmarks: 'benchmarkGroups',
  }

  const excludeKeyByType = {
    facts: 'excludeFacts',
    metrics: 'excludeMetrics',
    benchmarks: 'excludeBenchmarks',
  }

  const idsKey = idsKeyByType[type]
  const groupsKey = groupsKeyByType[type]
  const excludeKey = excludeKeyByType[type]

  const byIds = getCatalogItemsByIds(items, group?.[idsKey])
  const byGroups = getCatalogItemsByGroups(items, group?.[groupsKey])

  const merged = [...byIds, ...byGroups]

  const unique = Array.from(
    new Map(merged.map((item) => [item.id, item])).values()
  )

  return excludeCatalogItems(unique, group?.[excludeKey])
}

export function buildCatalogFactsMap(factsCatalog) {
  return new Map(
    Array.isArray(factsCatalog)
      ? factsCatalog.map((fact) => [fact.id, fact])
      : []
  )
}

export function resolveCatalogContexts({
  contexts = [],
  factsCatalog = [],
  metricsCatalog = [],
  benchmarksCatalog = [],
} = {}) {
  return Array.isArray(contexts)
    ? contexts.map((context) => ({
        ...context,
        groups: Array.isArray(context.groups)
          ? context.groups.map((group) => ({
              ...group,
              label: group.label || CATALOG_LABELS[group.id] || group.id,
              facts: resolveCatalogViewItems(factsCatalog, group, 'facts'),
              metrics: resolveCatalogViewItems(metricsCatalog, group, 'metrics'),
              benchmarks: resolveCatalogViewItems(benchmarksCatalog, group, 'benchmarks'),
            }))
          : [],
      }))
    : []
}
