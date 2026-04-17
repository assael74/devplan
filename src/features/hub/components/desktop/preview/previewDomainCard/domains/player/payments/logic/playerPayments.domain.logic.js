// domains/player/payments/logic/playerPayments.domain.logic.js

import { getFullDateIl } from '../../../../../../../../../../shared/format/dateUtiles.js'
import { PAYMENT_TYPES, PAYMENT_STATUSES } from '../../../../../../../../../../shared/payments/payments.constants.js'

const safeArr = (v) => (Array.isArray(v) ? v : [])
const safeStr = (v) => (v == null ? '' : String(v))
const safeNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const findPaymentType = (typeId) => {
  return PAYMENT_TYPES.find((item) => item?.id === typeId) || PAYMENT_TYPES[0] || null
}

const findPaymentStatus = (statusId) => {
  return PAYMENT_STATUSES.find((item) => item?.id === statusId) || PAYMENT_STATUSES[0] || null
}

const normalizeStatus = (payment = {}) => {
  const raw = safeStr(payment?.status?.id || payment?.status).trim()

  if (raw === 'new' || raw === 'invoice' || raw === 'done') return raw
  return 'new'
}

const normalizeType = (payment = {}) => {
  const raw = safeStr(payment?.type?.id || payment?.type).trim()

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

const getPaymentPlayer = (payment = {}, context = {}, player = null) => {
  if (payment?.player) return payment.player
  if (player) return player

  const playerId = payment?.playerId
  if (!playerId) return null

  if (context?.playersById[playerId]) return context.playersById[playerId]

  const allPlayers = Array.isArray(context?.players) ? context.players : []
  return allPlayers.find((p) => p?.id === playerId) || null
}

const formatStatusTime = (status = {}) => {
  const rawTime = status?.time
  if (!rawTime) return ''

  return getFullDateIl(rawTime)
}

export const formatPaymentsLabel = (payment) => {
  if (!payment) return ''

  const paymentFor = payment?.paymentFor || ''
  const price = payment?.price != null ? `${payment.price} ₪` : '0 ₪'

  return [paymentFor, price].filter(Boolean).join(' • ')
}

export const buildPlayerPaymentRow = (payment = {}, context = {}, player = null) => {
  const statusId = normalizeStatus(payment)
  const typeId = normalizeType(payment)
  const paymentFor = normalizePaymentFor(payment)
  const price = normalizePrice(payment)
  const onlyPriceLable = `${price} ₪`
  const priceVatLable = `${+(Number(price || 0) * 0.82).toFixed(2)} ₪`

  const statusMeta = findPaymentStatus(statusId)
  const typeMeta = findPaymentType(typeId)
  const paymentPlayer = getPaymentPlayer(payment, context, player)
  const playerDisplayName = [player?.playerFirstName?.trim(), player?.playerLastName?.trim()].filter(Boolean).join(' ') || 'ללא שם'

  return {
    ...payment,

    id: payment?.id || '',

    player: paymentPlayer,
    playerDisplayName,

    type: {
      id: typeId,
      labelH: typeMeta?.labelH || '',
      idIcon: typeMeta?.idIcon || '',
    },

    status: {
      ...(typeof payment?.status === 'object' && payment?.status ? payment.status : {}),
      id: statusId,
      labelH: statusMeta?.labelH || '',
      idIcon: statusMeta?.idIcon || '',
      color: statusMeta?.color || 'neutral',
    },

    paymentFor,
    price,
    priceVatLable,
    onlyPriceLable,
    priceLable: formatPaymentsLabel({ ...payment, paymentFor, price }),

    typeLable: typeMeta?.labelH || '',
    typeLabelH: typeMeta?.labelH || '',
    typeIdIcon: typeMeta?.idIcon || '',

    statusLabelH: statusMeta?.labelH || '',
    statusIdIcon: statusMeta?.idIcon || '',
    statusColor: statusMeta?.color || 'neutral',
    statusTime: formatStatusTime(payment?.status),

    isClosed: statusId === 'done',
  }
}

export const filterPlayerPayments = (rows = [], filters = {}) => {
  const q = safeStr(filters?.q).trim().toLowerCase()
  const statusFilter = safeStr(filters?.statusFilter)
  const typeFilter = safeStr(filters?.typeFilter)

  return rows.filter((row) => {
    if (statusFilter && statusFilter !== 'all' && row?.status?.id !== statusFilter) return false
    if (typeFilter && typeFilter !== 'all' && row?.type?.id !== typeFilter) return false

    if (!q) return true

    const text = [
      row?.paymentFor,
      row?.type?.id,
      row?.type?.labelH,
      row?.status?.id,
      row?.status?.labelH,
      row?.price,
      row?.player?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return text.includes(q)
  })
}

export const buildPlayerPaymentsSummary = (rows = []) => {
  const total = rows.length
  const openCount = rows.filter((row) => row?.status?.id === 'new' || row?.status?.id === 'invoice').length
  const doneCount = rows.filter((row) => row?.status?.id === 'done').length

  const totalAmount = rows.reduce((sum, row) => sum + safeNum(row?.price), 0)

  const doneAmount = rows
    .filter((row) => row?.status?.id === 'done')
    .reduce((sum, row) => sum + safeNum(row?.price), 0)

  const doneAmountNoVat = +(doneAmount * 0.82).toFixed(2)

  const lastPayment = rows.length ? rows[rows.length - 1] : null
  const nextOpenPayment = rows.find((row) => row?.status?.id === 'new' || row?.status?.id === 'invoice') || null

  return {
    total,
    openCount,
    doneCount,
    totalAmount,
    doneAmount,
    doneAmountNoVat,
    lastPayment,
    nextOpenPayment,
  }
}

export const resolvePlayerPaymentsDomain = (player, context = {}) => {
  const rawPayments = getPaymentsFromContext(player, context)
  const rows = safeArr(rawPayments).map((payment) => buildPlayerPaymentRow(payment, context, player))

  return {
    rows,
    summary: buildPlayerPaymentsSummary(rows),
  }
}
