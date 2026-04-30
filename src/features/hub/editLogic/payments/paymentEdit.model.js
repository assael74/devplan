// features/hub/editLogic/payments/paymentEdit.model.js

import { getFullDateIl } from '../../../../shared/format/dateUtiles.js'

export const safe = (value) => (value == null ? '' : String(value))
export const clean = (value) => safe(value).trim()

const toNum = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

export const getPaymentStatusId = (status) => {
  if (!status) return ''
  if (typeof status === 'string') return clean(status)

  if (typeof status === 'object') {
    return clean(status?.current?.id || status?.id)
  }

  return ''
}

export const getPaymentTypeId = (type) => {
  if (!type) return ''
  if (typeof type === 'string') return clean(type)

  if (typeof type === 'object') {
    return clean(type?.id)
  }

  return ''
}

const buildPlayerDisplayName = (player = {}) => {
  return [player?.playerFirstName, player?.playerLastName]
    .map(clean)
    .filter(Boolean)
    .join(' ')
}

export const buildPaymentName = (payment = {}) => {
  const typeLabel =
    clean(payment?.type?.labelH) ||
    clean(payment?.typeLable) ||
    clean(payment?.typeLabelH) ||
    clean(payment?.type)

  const paymentFor = clean(payment?.paymentFor || payment?.dueMonth)

  return [typeLabel, paymentFor].filter(Boolean).join(' • ') || 'תשלום'
}

export const buildPaymentMeta = (payment = {}) => {
  const playerName = buildPlayerDisplayName(payment?.player)
  const paymentFor = clean(payment?.paymentFor || payment?.dueMonth)
  const payerName = clean(payment?.payerName)
  const price = toNum(payment?.price) ? `${toNum(payment?.price)} ₪` : ''
  const createdAt = payment?.createdAt ? getFullDateIl(payment.createdAt) : ''

  return [playerName, paymentFor, payerName, price, createdAt]
    .filter(Boolean)
    .join(' | ') || 'פרטי תשלום'
}

const normalizeStatus = (status) => {
  if (status && typeof status === 'object') {
    return {
      id: clean(status?.current?.id || status?.id || 'new'),
      time: toNum(status?.current?.time || status?.time),
    }
  }

  return {
    id: clean(status || 'new'),
    time: 0,
  }
}

export const buildPaymentEditInitial = (payment = {}) => {
  const source = payment?.raw || payment?.payment || payment || {}
  const status = normalizeStatus(source?.status)

  return {
    id: clean(source?.id || source?.paymentId),
    playerId: clean(source?.playerId || source?.player?.id),
    teamId: clean(source?.teamId),
    clubId: clean(source?.clubId),

    name: buildPaymentName(source),

    price: source?.price ?? '',
    type: getPaymentTypeId(source?.type || source?.typeId || 'monthlyPayment'),
    typeId: getPaymentTypeId(source?.typeId || source?.type || 'monthlyPayment'),

    paymentFor: clean(source?.paymentFor || source?.dueMonth),
    dueMonth: clean(source?.dueMonth || source?.paymentFor),

    payerParentId: clean(source?.payerParentId),
    payerName: clean(source?.payerName),

    status: {
      id: status.id || 'new',
      time: status.time || 0,
    },

    createdAt: source?.createdAt || null,
    raw: source,
    metaLabel: buildPaymentMeta(source),
  }
}

export const buildPaymentEditPatch = (draft = {}, initial = {}) => {
  const next = {}

  if (toNum(draft?.price) !== toNum(initial?.price)) {
    next.price = toNum(draft?.price)
  }

  const nextType = clean(draft?.typeId || draft?.type)
  const baseType = clean(initial?.typeId || initial?.type)

  if (nextType !== baseType) {
    next.type = nextType
  }

  const nextPaymentFor = clean(draft?.paymentFor || draft?.dueMonth)
  const basePaymentFor = clean(initial?.paymentFor || initial?.dueMonth)

  if (nextPaymentFor !== basePaymentFor) {
    next.paymentFor = nextPaymentFor
    next.dueMonth = nextPaymentFor
  }

  if (clean(draft?.payerParentId) !== clean(initial?.payerParentId)) {
    next.payerParentId = clean(draft?.payerParentId)
  }

  if (clean(draft?.payerName) !== clean(initial?.payerName)) {
    next.payerName = clean(draft?.payerName)
  }

  const nextStatus = getPaymentStatusId(draft?.status)
  const baseStatus = getPaymentStatusId(initial?.status)

  if (nextStatus !== baseStatus) {
    next.status = {
      id: nextStatus || 'new',
      time: Date.now(),
    }
  }

  return next
}

export const isPaymentEditDirty = (draft = {}, initial = {}) => {
  return Object.keys(buildPaymentEditPatch(draft, initial)).length > 0
}

export const getPaymentEditFieldErrors = (draft = {}) => {
  return {
    paymentFor: !clean(draft?.paymentFor || draft?.dueMonth),
    type: !clean(draft?.type || draft?.typeId),
    price: toNum(draft?.price) <= 0,
  }
}

export const getIsPaymentEditValid = (draft = {}) => {
  return !Object.values(getPaymentEditFieldErrors(draft)).some(Boolean)
}
