// features/insightsHub/shared/logic/insights/insights.resolve.js

export function buildMetricsMap(metricsCatalog) {
  return new Map(
    Array.isArray(metricsCatalog)
      ? metricsCatalog.map((metric) => [metric.id, metric])
      : []
  )
}

export function getMetricLabel(metricsMap, metricId) {
  return metricsMap.get(metricId)?.label || metricId
}

export function getInsightBasedMetrics(insight) {
  return Array.isArray(insight?.basedOnMetrics)
    ? insight.basedOnMetrics
    : []
}

export function getInsightMissingMetrics(insight) {
  return Array.isArray(insight?.missingMetrics)
    ? insight.missingMetrics
    : []
}

export function getInsightRequiredNewFacts(insight) {
  return Array.isArray(insight?.requiredNewFacts)
    ? insight.requiredNewFacts
    : []
}

export function getInsightBasedBenchmarks(insight) {
  return Array.isArray(insight?.basedOnBenchmarks)
    ? insight.basedOnBenchmarks
    : []
}

export function getInsightMissingBenchmarks(insight) {
  return Array.isArray(insight?.missingBenchmarks)
    ? insight.missingBenchmarks
    : []
}

export function getInsightMeta(insight) {
  const basedOnMetrics = getInsightBasedMetrics(insight)
  const missingMetrics = getInsightMissingMetrics(insight)
  const requiredNewFacts = getInsightRequiredNewFacts(insight)
  const basedOnBenchmarks = getInsightBasedBenchmarks(insight)
  const missingBenchmarks = getInsightMissingBenchmarks(insight)

  return {
    usage: insight?.usage || 'candidate',
    readiness: insight?.readiness || 'needsValidation',

    basedOnMetrics,
    missingMetrics,
    requiredNewFacts,
    basedOnBenchmarks,
    missingBenchmarks,

    basedCount: basedOnMetrics.length,
    missingCount: missingMetrics.length,
    factsMissingCount: requiredNewFacts.length,
    benchmarksCount: basedOnBenchmarks.length,
    missingBenchmarksCount: missingBenchmarks.length,
  }
}

export function resolveInsightsByContexts({
  contexts = [],
  insightsCatalog = [],
} = {}) {
  if (!Array.isArray(contexts) || !Array.isArray(insightsCatalog)) return []

  return contexts
    .map((context) => {
      const groups = Array.isArray(context.groups) ? context.groups : []

      const resolvedGroups = groups
        .map((group) => {
          const insights = insightsCatalog.filter((insight) => {
            return insight.context === context.id && insight.group === group.id
          })

          return {
            id: group.id,
            label: group.label || group.id,
            insights,
          }
        })
        .filter((group) => group.insights.length > 0)

      return {
        ...context,
        groups: resolvedGroups,
      }
    })
    .filter((context) => context.groups.length > 0)
}
