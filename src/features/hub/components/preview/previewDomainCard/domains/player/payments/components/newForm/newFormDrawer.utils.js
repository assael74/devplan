// previewDomainCard/domains/player/payments/components/newForm/newFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())

export function buildInitialDraft(context = {}) {
  const entity = context?.entity || null
  const playerId = safe(context?.playerId || entity?.id || context?.player?.id)

  return {
    paymentFor: '',
    playerId,
    type: 'monthlyPayment',
    price: '',
  }
}

export function getValidity(draft = {}) {
  const paymentFor = safe(draft?.paymentFor)
  const playerId = safe(draft?.playerId)
  const type = safe(draft?.type)
  const price = safe(draft?.price)

  return {
    okPaymentFor: !!paymentFor,
    okPlayerId: !!playerId,
    okType: !!type,
    okPrice: !!price,
  }
}

export function getIsValid(validity = {}) {
  return Boolean(
    validity?.okPaymentFor &&
      validity?.okPlayerId &&
      validity?.okType &&
      validity?.okPrice
  )
}

export function getIsDirty(draft = {}, initial = {}) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}
