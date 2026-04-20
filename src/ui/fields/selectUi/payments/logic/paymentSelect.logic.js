// ui/fields/selectUi/payments/logic/paymentSelect.logic.js

const clean = (v) => String(v ?? '').trim()

export function normalizePaymentStatus(item) {
  return {
    value: clean(item?.id),
    label: clean(item?.labelH || item?.label || item?.id) || 'סטטוס',
    idIcon: clean(item?.idIcon || 'payments'),
    color: clean(item?.color || 'neutral'),
    disabled: Boolean(item?.disabled),
    raw: item,
  }
}

export function buildOptions(options = []) {
  return options
    .map((item) => normalizePaymentStatus(item))
    .filter((item) => item.value)
}

export function findSelected(value, normalizedOptions) {
  const id = clean(value)
  if (!id) return null
  return normalizedOptions.find((item) => item.value === id) || null
}

export function formatAff(opt) {
  const parts = [
    clean(opt?.value),
  ].filter(Boolean)

  return parts.join(' • ')
}
