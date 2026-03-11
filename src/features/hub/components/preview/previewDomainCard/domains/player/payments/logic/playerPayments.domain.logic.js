// domains/player/payments/logic/playerPayments.domain.logic.js

// domains/player/payments/logic/playerPayments.domain.logic.js

const safeArr = (v) => (Array.isArray(v) ? v : [])
const safeStr = (v) => (v == null ? '' : String(v))
const safeNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const normalizeStatus = (payment = {}) => {
  const raw = safeStr(payment?.status).trim()
  if (raw === 'new' || raw === 'invoice' || raw === 'done') return raw
  return 'new'
}

const normalizeType = (payment = {}) => {
  const raw = safeStr(payment?.type).trim()
  if (raw === 'monthlyPayment' || raw === 'oneTimePayment') return raw
  return 'monthlyPayment'
}

const normalizePaymentFor = (payment = {}) => {
  return safeStr(payment?.paymentFor).trim()
}

const normalizePrice = (payment = {}) => {
  const price = payment?.price
  if (price === '' || price == null) return 0
  return safeNum(price)
}

const getPaymentsFromContext = (player, context = {}) => {
  if (Array.isArray(player?.playerPayments)) return player.playerPayments
  if (Array.isArray(player?.payments)) return player.payments

  const paymentIds = player?.playerPaymentsId || player?.paymentsId || []
  if (!Array.isArray(paymentIds) || !paymentIds.length) return []

  const byId = context?.paymentsById || {}
  const allPayments = Array.isArray(context?.payments) ? context.payments : []

  return paymentIds
    .map((id) => byId[id] || allPayments.find((p) => p?.id === id))
    .filter(Boolean)
}

export const buildPlayerPaymentRow = (payment = {}) => {
  const status = normalizeStatus(payment)
  const type = normalizeType(payment)
  const paymentFor = normalizePaymentFor(payment)
  const price = normalizePrice(payment)

  return {
    ...payment,
    id: payment?.id || '',
    status,
    type,
    paymentFor,
    price,
    isClosed: status === 'done',
  }
}

export const filterPlayerPayments = (rows = [], filters = {}) => {
  const q = safeStr(filters?.q).trim().toLowerCase()
  const statusFilter = safeStr(filters?.statusFilter)
  const typeFilter = safeStr(filters?.typeFilter)

  return rows.filter((row) => {
    if (statusFilter && statusFilter !== 'all' && row?.status !== statusFilter) return false
    if (typeFilter && typeFilter !== 'all' && row?.type !== typeFilter) return false

    if (!q) return true

    const text = [
      row?.paymentFor,
      row?.type,
      row?.status,
      row?.price,
      row?.note,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return text.includes(q)
  })
}

export const formatPaymentsLabel = (payment) => {
  if (!payment) return ''

  const paymentFor = payment?.paymentFor || ''
  const price = payment?.price != null ? `${payment.price} ₪` : '0 ₪'

  return [paymentFor, price].filter(Boolean).join(' • ')
}

export const buildPlayerPaymentsSummary = (rows = []) => {
  const total = rows.length
  const openCount = rows.filter((row) => row?.status === 'new' || row?.status === 'invoice').length
  const doneCount = rows.filter((row) => row?.status === 'done').length

  const totalAmount = rows.reduce((sum, row) => sum + safeNum(row?.price), 0)
  const doneAmount = rows
    .filter((row) => row?.status === 'done')
    .reduce((sum, row) => sum + safeNum(row?.price), 0)

  const lastPayment = rows.length ? rows[rows.length - 1] : null
  const nextOpenPayment = rows.find((row) => row?.status === 'new' || row?.status === 'invoice') || null

  return {
    total,
    openCount,
    doneCount,
    totalAmount,
    doneAmount,
    lastPayment,
    nextOpenPayment,
  }
}

export const resolvePlayerPaymentsDomain = (player, context = {}) => {
  const rawPayments = getPaymentsFromContext(player, context)
  const rows = safeArr(rawPayments).map(buildPlayerPaymentRow)

  return {
    rows,
    summary: buildPlayerPaymentsSummary(rows),
  }
}
