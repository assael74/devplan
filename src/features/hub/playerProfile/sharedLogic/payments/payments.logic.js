// playerProfile/sharedLogic/payments/payments.logic.js

import { normalizePlayerPayments } from './payments.normalize.js'
import { applyPaymentsFilters, buildPaymentsIndicators } from './payments.filters.js'
import { buildPaymentsSummary } from './payments.summary.js'
import { buildPaymentsFilterOptions } from './payments.options.js'

export function resolvePlayerPaymentsDomain(player, filters = {}) {
  const itemsAll = normalizePlayerPayments(player)
  const options = buildPaymentsFilterOptions(player, itemsAll)
  const itemsFiltered = applyPaymentsFilters(itemsAll, filters)
  const summary = buildPaymentsSummary(itemsFiltered)
  const indicators = buildPaymentsIndicators(filters, options)

  return {
    itemsAll,
    itemsFiltered,
    summary,
    options,
    indicators,
    hasActiveFilters: indicators.length > 0,
  }
}
