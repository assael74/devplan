// previewDomainCard/domains/player/payments/components/drawer/editDrawer.utils.js

import { getFullDateIl } from '../../../../../../../../../../../shared/format/dateUtiles.js'

export const safe = (value) => (value == null ? '' : String(value))

const clean = (value) => safe(value).trim()

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

export const buildPlayerDisplayName = (player) => {
  return [player?.playerFirstName, player?.playerLastName]
    .map((value) => clean(value))
    .filter(Boolean)
    .join(' ')
}

export const buildPaymentName = (payment) => {
  const typeLabel =
    clean(payment?.type?.labelH) ||
    clean(payment?.typeLable) ||
    clean(payment?.typeLabelH) ||
    clean(payment?.type)

  const paymentFor = clean(payment?.paymentFor)

  return [typeLabel, paymentFor].filter(Boolean).join(' • ') || 'תשלום'
}

export const buildPaymentMeta = (payment) => {
  const playerName = buildPlayerDisplayName(payment?.player)
  const paymentFor = clean(payment?.paymentFor)
  const dateLabel = payment?.createdAt ? getFullDateIl(payment.createdAt) : ''

  return [playerName, paymentFor, dateLabel].filter(Boolean).join(' | ') || 'פרטי תשלום'
}

export const buildInitialDraft = (payment) => {
  const source = payment || {}

  return {
    id: source?.id || '',
    playerId: source?.playerId || source?.player?.id || '',
    name: buildPaymentName(source),
    paymentFor: source?.paymentFor || '',
    type: getPaymentTypeId(source?.type) || '',
    status: getPaymentStatusId(source?.status) || '',
    price: source?.price ?? '',
    raw: source,
    metaLabel: buildPaymentMeta(source),
  }
}

export const buildPaymentPatch = (initial, draft) => {
  const next = {}

  if ((draft?.paymentFor || '') !== (initial?.paymentFor || '')) {
    next.paymentFor = draft?.paymentFor || ''
  }

  if ((draft?.type || '') !== (initial?.type || '')) {
    next.type = draft?.type || ''
  }

  if ((draft?.status || '') !== (initial?.status || '')) {
    next.status = {
      id: draft?.status || '',
      time: Date.now(),
    }
  }

  if ((draft?.price ?? '') !== (initial?.price ?? '')) {
    next.price = draft?.price ?? ''
  }

  return next
}

export const buildPatch = (initial, draft) => {
  return buildPaymentPatch(initial, draft)
}

export const getIsDirty = (initial, draft) => {
  const patch = buildPatch(initial, draft)
  return Object.keys(patch).length > 0
}
