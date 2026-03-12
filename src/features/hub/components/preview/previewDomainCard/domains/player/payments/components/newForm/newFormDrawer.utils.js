// previewDomainCard/domains/player/payments/components/newForm/newFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())

export function buildInitialDraft(context = {}) {
  const entity = context?.entity || null
  const playerId = safe(context?.playerId || entity?.id || context?.player?.id)

  return {
    paymentFor: '',
    playerId,
    type: 'monthlyPayment',
    price: ''
  }
}

export function getIsDirty(draft, initial) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}
