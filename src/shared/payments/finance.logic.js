// src/shared/payments/finance.logic.js

import moment from 'moment'

import { getPaymentStatusMeta, getPaymentTypeMeta, toYearMonth } from './payments.utils.js'

const safeArr = value => (Array.isArray(value) ? value : [])
const safe = value => (value == null ? '' : String(value).trim())

function toNum(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function playerName(player) {
  const fullName = safe(player?.playerFullName)
  if (fullName) return fullName

  const firstName = safe(player?.playerFirstName)
  const lastName = safe(player?.playerLastName)
  return `${firstName} ${lastName}`.trim() || 'ללא שם'
}

function statusId(payment) {
  return safe(payment?.status?.id || payment?.status || 'new')
}

function paymentId(payment, index, prefix) {
  return safe(payment?.id || payment?.paymentId || `${prefix}-${index}`)
}

function projectRows(players = []) {
  const rows = []

  safeArr(players)
    .filter(player => player?.type === 'project')
    .forEach(player => {
      safeArr(player?.payments).forEach((payment, index) => {
        const currentStatusId = statusId(payment)
        const dueMonth = toYearMonth(
          payment?.dueMonth || payment?.paymentFor || payment?.month || ''
        )
        const amount = toNum(payment?.price || payment?.amount)

        rows.push({
          id: `project-${player.id}-${paymentId(payment, index, 'payment')}`,
          paymentId: paymentId(payment, index, 'payment'),
          playerId: safe(player?.id),
          playerName: playerName(player),
          playerKind: 'project',
          playerKindLabel: 'פרויקט',
          typeId: safe(payment?.type || 'monthlyPayment'),
          paymentFor: safe(payment?.paymentFor || payment?.title || dueMonth),
          dueMonth,
          amount,
          paidAmount: currentStatusId === 'done' ? amount : 0,
          remainingAmount: currentStatusId === 'done' ? 0 : amount,
          statusId: currentStatusId,
          statusLabel: getPaymentStatusMeta(currentStatusId)?.labelH || 'פתוח',
          statusColor: getPaymentStatusMeta(currentStatusId)?.color || 'neutral',
          typeLabel: getPaymentTypeMeta(payment?.type)?.labelH || 'תשלום',
          paidAt: '',
          raw: payment,
        })
      })
    })

  return rows
}

function privateRows(players = []) {
  const rows = []

  safeArr(players).forEach(player => {
    const payments = Array.isArray(player?.payments)
      ? player.payments
      : safeArr(player?.playerPayments)

    payments
      .filter(payment => safe(payment?.type || payment?.typeId) === 'privateAgreement')
      .forEach((payment, index) => {
        const installments = safeArr(payment?.installments)
        const totalAmount = toNum(payment?.totalAmount || payment?.price)
        const paidAmount = installments.reduce((sum, item) => sum + toNum(item?.amount), 0)
        const remainingAmount = Math.max(0, totalAmount - paidAmount)
        const agreementStatus = remainingAmount <= 0 && totalAmount > 0
          ? 'done'
          : paidAmount > 0
            ? 'partial'
            : 'open'

        rows.push({
          id: `private-${player.id}-${paymentId(payment, index, 'agreement')}`,
          paymentId: paymentId(payment, index, 'agreement'),
          playerId: safe(player?.id),
          playerName: playerName(player),
          playerKind: 'private',
          playerKindLabel: 'פרטי',
          typeId: 'privateAgreement',
          typeLabel: 'התקשרות פרטית',
          paymentFor: safe(payment?.title || 'התקשרות פרטית'),
          dueMonth: '',
          amount: totalAmount,
          paidAmount,
          remainingAmount,
          statusId: agreementStatus,
          statusLabel: agreementStatus === 'done'
            ? 'נסגר'
            : agreementStatus === 'partial'
              ? 'שולם חלקית'
              : 'פתוח',
          statusColor: agreementStatus === 'done'
            ? 'success'
            : agreementStatus === 'partial'
              ? 'warning'
              : 'neutral',
          startDate: safe(payment?.startDate),
          durationMonths: toNum(payment?.durationMonths),
          installments,
          raw: payment,
        })
      })
  })

  return rows
}

function isOverdue(row, currentMonth) {
  if (row?.playerKind !== 'project') return false
  if (!row?.dueMonth || row?.statusId === 'done') return false
  return row.dueMonth < currentMonth
}

function currentMonthPaid(row, currentMonth) {
  if (row?.playerKind === 'project') {
    return row?.dueMonth === currentMonth && row?.statusId === 'done'
      ? toNum(row?.amount)
      : 0
  }

  return safeArr(row?.installments).reduce((sum, item) => {
    const month = moment(item?.paidAt, ['YYYY-MM-DD', moment.ISO_8601], true).isValid()
      ? moment(item.paidAt).format('YYYY-MM')
      : ''

    return month === currentMonth ? sum + toNum(item?.amount) : sum
  }, 0)
}

export function buildFinanceRows({ players = [], privatePlayers = [] } = {}) {
  return [
    ...projectRows(players),
    ...privateRows(privatePlayers),
  ]
}

export function buildFinanceSummary(rows = [], now = moment()) {
  const list = safeArr(rows)
  const currentMonth = moment(now).format('YYYY-MM')

  const expected = list.reduce((sum, row) => {
    if (row?.playerKind !== 'project' || row?.dueMonth !== currentMonth) return sum
    return sum + toNum(row?.amount)
  }, 0)

  const received = list.reduce(
    (sum, row) => sum + currentMonthPaid(row, currentMonth),
    0
  )

  const open = list.reduce((sum, row) => sum + toNum(row?.remainingAmount), 0)
  const overdue = list.reduce((sum, row) => {
    return isOverdue(row, currentMonth) ? sum + toNum(row?.remainingAmount) : sum
  }, 0)

  return {
    expected,
    received,
    open,
    overdue,
    currentMonth,
  }
}


export function buildFinanceMonths(rows = [], now = moment(), count = 6) {
  return Array.from({ length: count }, (_, index) => {
    const month = moment(now).startOf('month').subtract(index, 'months')
    const key = month.format('YYYY-MM')

    const received = safeArr(rows).reduce(
      (sum, row) => sum + currentMonthPaid(row, key),
      0
    )

    const open = safeArr(rows).reduce((sum, row) => {
      if (row?.playerKind !== 'project' || row?.dueMonth !== key) return sum
      return sum + toNum(row?.remainingAmount)
    }, 0)

    return {
      key,
      label: month.format('MM/YYYY'),
      received,
      open,
    }
  })
}

export function buildFinanceAttention(rows = [], now = moment()) {
  const currentMonth = moment(now).format('YYYY-MM')

  return safeArr(rows)
    .filter(row => isOverdue(row, currentMonth) || row?.statusId === 'invoice')
    .map(row => ({
      ...row,
      attentionLabel: isOverdue(row, currentMonth) ? 'באיחור' : 'חשבונית',
      attentionColor: isOverdue(row, currentMonth) ? 'danger' : 'neutral',
    }))
    .sort((a, b) => {
      if (a.attentionColor === 'danger' && b.attentionColor !== 'danger') return -1
      if (a.attentionColor !== 'danger' && b.attentionColor === 'danger') return 1
      return safe(a?.dueMonth).localeCompare(safe(b?.dueMonth))
    })
}

export function filterFinanceRows(rows = [], filters = {}, now = moment()) {
  const currentMonth = moment(now).format('YYYY-MM')
  const search = safe(filters?.search).toLowerCase()
  const playerKind = safe(filters?.playerKind || 'all')
  const status = safe(filters?.status || 'all')
  const month = safe(filters?.month || 'all')

  return safeArr(rows).filter(row => {
    if (search && !safe(row?.playerName).toLowerCase().includes(search)) return false
    if (playerKind !== 'all' && row?.playerKind !== playerKind) return false

    if (status === 'open' && row?.remainingAmount <= 0) return false
    if (status === 'done' && row?.remainingAmount > 0) return false
    if (status === 'overdue' && !isOverdue(row, currentMonth)) return false

    if (month !== 'all') {
      if (row?.playerKind === 'project' && row?.dueMonth !== month) return false
      if (row?.playerKind === 'private') return false
    }

    return true
  })
}
