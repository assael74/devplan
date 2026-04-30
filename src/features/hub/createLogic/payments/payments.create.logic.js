const safe = (v) => (v == null ? '' : String(v).trim())

const toNumOrZero = (v) => {
  if (v === '' || v == null) return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function buildComparablePaymentCreateDraft(draft = {}) {
  return {
    paymentFor: safe(draft?.paymentFor),
    playerId: safe(draft?.playerId),
    type: safe(draft?.type),
    price: safe(draft?.price),
  }
}

export function buildPaymentCreateDraft(context = {}) {
  const entity = context?.entity || null
  const player = context?.player || entity || null
  const playerId = safe(context?.playerId || player?.id)

  return {
    paymentFor: '',
    playerId,
    type: 'monthlyPayment',
    price: '',
  }
}

export function getPaymentCreateValidity(draft = {}) {
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

export function validatePaymentCreateDraft(draft = {}) {
  const validity = getPaymentCreateValidity(draft)

  const errors = {
    paymentFor: !validity.okPaymentFor,
    playerId: !validity.okPlayerId,
    type: !validity.okType,
    price: !validity.okPrice,
  }

  const valid = Boolean(
    validity.okPaymentFor &&
      validity.okPlayerId &&
      validity.okType &&
      validity.okPrice
  )

  if (errors.paymentFor) {
    return {
      valid: false,
      ok: false,
      message: 'יש להזין עבור מה התשלום',
      errors,
      validity,
    }
  }

  if (errors.playerId) {
    return {
      valid: false,
      ok: false,
      message: 'חסר שחקן',
      errors,
      validity,
    }
  }

  if (errors.type) {
    return {
      valid: false,
      ok: false,
      message: 'יש לבחור סוג תשלום',
      errors,
      validity,
    }
  }

  if (errors.price) {
    return {
      valid: false,
      ok: false,
      message: 'יש להזין סכום',
      errors,
      validity,
    }
  }

  return {
    valid,
    ok: valid,
    message: '',
    errors,
    validity,
  }
}

export function isPaymentCreateDirty(draft = {}, initial = {}) {
  return (
    JSON.stringify(buildComparablePaymentCreateDraft(draft)) !==
    JSON.stringify(buildComparablePaymentCreateDraft(initial))
  )
}

export function buildPaymentCreatePayload(draft = {}, context = {}) {
  const createdAt = Date.now()

  return {
    paymentFor: safe(draft?.paymentFor),
    playerId: safe(draft?.playerId || context?.playerId || context?.player?.id),
    type: safe(draft?.type || 'monthlyPayment'),
    price: toNumOrZero(draft?.price),

    status: {
      id: 'new',
      time: createdAt,
    },

    createdAt,
    updatedAt: createdAt,
  }
}

export function buildPaymentCreateMeta(draft = {}, context = {}) {
  const validation = validatePaymentCreateDraft(draft, context)

  return {
    title: 'תשלום חדש',
    saveText: 'יצירת תשלום',
    savingText: 'יוצר תשלום...',
    valid: validation.valid,
    ok: validation.ok,
    message: validation.message,
    errors: validation.errors,
    validity: validation.validity,
  }
}
