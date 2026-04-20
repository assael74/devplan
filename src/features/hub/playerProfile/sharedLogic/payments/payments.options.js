// playerProfile/sharedLogic/payments/payments.options.js

import {
  getPaymentStatusList,
  getPaymentTypeList,
} from '../../../../../shared/payments/payments.utils.js'

function toStr(v) {
  return v == null ? '' : String(v).trim()
}

export function buildPaymentsFilterOptions(player, items) {
  const list = Array.isArray(items) ? items : []
  const parents = Array.isArray(player?.parents) ? player.parents : []

  const months = Array.from(
    new Set(list.map((payment) => payment?.dueMonth).filter(Boolean))
  ).sort()

  const parentOptions = parents
    .map((parent) => ({
      id: toStr(parent?.id),
      label: parent?.parentName || 'הורה',
    }))
    .filter((item) => item.id)

  const statusOptions = getPaymentStatusList().filter((item) => !item.disabled)
  const typeOptions = getPaymentTypeList().filter((item) => !item.disabled)

  return {
    months,
    parentOptions,
    statusOptions,
    typeOptions,
  }
}
