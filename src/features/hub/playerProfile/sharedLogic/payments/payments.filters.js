// playerProfile/sharedLogic/payments/payments.filters.js

import { toYearMonth } from '../../../../../shared/payments/payments.utils.js'

function toStr(v) {
  return v == null ? '' : String(v).trim()
}

export function createInitialPaymentsFilters() {
  return {
    dueMonth: '',
    statusId: 'all',
    typeId: 'all',
    payerParentId: 'all',
    teamId: 'all',
  }
}

export function applyPaymentsFilters(items, filters) {
  const list = Array.isArray(items) ? items : []
  const nextFilters = filters || {}

  const dueMonth = toYearMonth(nextFilters?.dueMonth)
  const statusId = toStr(nextFilters?.statusId || '')
  const typeId = toStr(nextFilters?.typeId || '')
  const payerParentId = toStr(nextFilters?.payerParentId || '')
  const teamId = toStr(nextFilters?.teamId || '')

  return list.filter((payment) => {
    if (dueMonth && payment?.dueMonth !== dueMonth) return false
    if (statusId && statusId !== 'all' && payment?.status?.id !== statusId) return false
    if (typeId && typeId !== 'all' && payment?.typeId !== typeId) return false
    if (payerParentId && payerParentId !== 'all' && payment?.payerParentId !== payerParentId) return false
    if (teamId && teamId !== 'all' && payment?.teamId !== teamId) return false
    return true
  })
}

export function buildPaymentsIndicators(filters, options = {}) {
  const indicators = []
  const f = filters || {}

  if (f?.dueMonth) {
    indicators.push({
      id: 'dueMonth',
      label: `חודש: ${f.dueMonth}`,
      idIcon: 'calendar',
      color: 'primary',
    })
  }

  if (f?.statusId && f.statusId !== 'all') {
    const status = (options?.statusOptions || []).find((item) => item.id === f.statusId)
    indicators.push({
      id: 'statusId',
      label: `סטטוס: ${status?.labelH || f.statusId}`,
      idIcon: 'payments',
      color: 'primary',
    })
  }

  if (f?.typeId && f.typeId !== 'all') {
    const type = (options?.typeOptions || []).find((item) => item.id === f.typeId)
    indicators.push({
      id: 'typeId',
      label: `סוג: ${type?.labelH || f.typeId}`,
      idIcon: 'payments',
      color: 'primary',
    })
  }

  if (f?.payerParentId && f.payerParentId !== 'all') {
    const parent = (options?.parentOptions || []).find((item) => item.id === f.payerParentId)
    indicators.push({
      id: 'payerParentId',
      label: `משלם: ${parent?.label || 'הורה'}`,
      idIcon: 'group',
      color: 'primary',
    })
  }

  return indicators
}

export function clearPaymentsIndicator(filters, indicatorId) {
  const next = { ...(filters || {}) }

  if (indicatorId === 'dueMonth') next.dueMonth = ''
  if (indicatorId === 'statusId') next.statusId = 'all'
  if (indicatorId === 'typeId') next.typeId = 'all'
  if (indicatorId === 'payerParentId') next.payerParentId = 'all'

  return next
}
