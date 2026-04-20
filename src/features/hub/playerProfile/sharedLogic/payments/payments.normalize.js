// playerProfile/sharedLogic/payments/payments.normalize.js

import moment from 'moment'
import {
  getPaymentStatusMeta,
  getPaymentTypeMeta,
  isPaymentOpen,
  toYearMonth,
} from '../../../../../shared/payments/payments.utils.js'

function toNum(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function toStr(v) {
  return v == null ? '' : String(v).trim()
}

function pickId(payment, index) {
  return toStr(payment?.id || payment?.paymentId || index)
}

export function normalizePlayerPayments(player) {
  const source = Array.isArray(player?.payments) ? player.payments : []
  const parents = Array.isArray(player?.parents) ? player.parents : []

  return source.map((payment, index) => {
    const statusId = toStr(payment?.status?.id || payment?.status || 'new')
    const statusTime = toStr(payment?.status?.time || payment?.statusTime || '')
    const dueMonth = toYearMonth(payment?.dueMonth || payment?.paymentFor || payment?.month || '')

    const payerParentId = toStr(payment?.payerParentId || payment?.parentId || '')
    const parent =
      payerParentId
        ? parents.find((item) => toStr(item?.id) === payerParentId) || null
        : null

    const typeId = toStr(payment?.type || 'monthlyPayment')

    return {
      id: pickId(payment, index),

      playerId: toStr(payment?.playerId || player?.id || ''),
      teamId: toStr(payment?.teamId || player?.teamId || player?.team?.id || ''),
      clubId: toStr(payment?.clubId || player?.clubId || player?.club?.id || ''),

      price: toNum(payment?.price ?? payment?.amount ?? 0),

      typeId,
      paymentFor: toStr(payment?.paymentFor || payment?.title || ''),
      dueMonth,

      status: {
        id: statusId,
        time: statusTime || moment().format('DD/MM/YYYY'),
      },

      payerParentId,
      payerName: toStr(parent?.parentName || payment?.payerName || ''),

      createdAt: payment?.createdAt || null,
      raw: payment,

      meta: {
        status: getPaymentStatusMeta(statusId),
        type: getPaymentTypeMeta(typeId),
        isOpen: isPaymentOpen(statusId),
      },
    }
  })
}
