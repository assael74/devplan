// playerProfile/sharedLogic/payments/payments.edit.logic.js

function safeStr(value) {
  return value == null ? '' : String(value).trim()
}

function safeNum(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function normalizeMonth(value) {
  return safeStr(value)
}

function normalizeStatus(value) {
  if (value && typeof value === 'object') {
    return {
      id: safeStr(value.id || 'new'),
      time: safeNum(value.time),
    }
  }

  return {
    id: safeStr(value || 'new'),
    time: 0,
  }
}

export function buildPaymentInitialDraft(payment) {
  const item = payment || null
  const status = normalizeStatus(item?.status)

  return {
    id: safeStr(item?.id),
    playerId: safeStr(item?.playerId),
    teamId: safeStr(item?.teamId),
    clubId: safeStr(item?.clubId),

    price: safeNum(item?.price),
    typeId: safeStr(item?.typeId || item?.type || 'monthlyPayment'),
    paymentFor: normalizeMonth(item?.paymentFor || item?.dueMonth || ''),
    dueMonth: normalizeMonth(item?.dueMonth || item?.paymentFor || ''),

    payerParentId: safeStr(item?.payerParentId),
    payerName: safeStr(item?.payerName),

    status,
    createdAt: item?.createdAt || null,
    raw: item,
  }
}

export function buildPaymentPatch(draft, initial) {
  const next = draft || {}
  const base = initial || {}

  const patch = {}

  if (safeNum(next.price) !== safeNum(base.price)) {
    patch.price = safeNum(next.price)
  }

  if (safeStr(next.typeId) !== safeStr(base.typeId)) {
    patch.type = safeStr(next.typeId)
  }

  const nextPaymentFor = normalizeMonth(next.paymentFor)
  const basePaymentFor = normalizeMonth(base.paymentFor)

  if (nextPaymentFor !== basePaymentFor) {
    patch.paymentFor = nextPaymentFor
    patch.dueMonth = nextPaymentFor
  }

  if (safeStr(next.payerParentId) !== safeStr(base.payerParentId)) {
    patch.payerParentId = safeStr(next.payerParentId)
  }

  if (safeStr(next.payerName) !== safeStr(base.payerName)) {
    patch.payerName = safeStr(next.payerName)
  }

  const nextStatus = normalizeStatus(next.status)
  const baseStatus = normalizeStatus(base.status)

  if (safeStr(nextStatus.id) !== safeStr(baseStatus.id)) {
    patch.status = {
      id: nextStatus.id || 'new',
      time: Date.now(),
    }
  }

  return patch
}

export function getIsPaymentDirty(draft, initial) {
  const patch = buildPaymentPatch(draft, initial)
  return Object.keys(patch).length > 0
}

export function buildPaymentMeta(payment) {
  const item = payment || {}

  const parts = [
    safeStr(item?.paymentFor || item?.dueMonth),
    safeStr(item?.payerName),
    safeNum(item?.price) ? `${safeNum(item.price)} ₪` : '',
  ].filter(Boolean)

  return parts.join(' • ') || 'עריכת תשלום'
}
