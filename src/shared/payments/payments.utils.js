// src/shared/payments/payments.utils.js
import { OPEN_PAYMENT_STATUS_IDS, PAYMENT_STATUSES, PAYMENT_TYPES } from './payments.constants'

export const isPaymentOpen = (statusId) => OPEN_PAYMENT_STATUS_IDS.has(statusId)

// --- META SINGLE ---
export const getPaymentStatusMeta = (statusId) =>
  PAYMENT_STATUSES.find((s) => s.id === statusId) || null

export const getPaymentTypeMeta = (typeId) =>
  PAYMENT_TYPES.find((t) => t.id === typeId) || null

// --- LISTS (לשימוש ב-UI: סלקטים, פילטרים, צעדים) ---
export const getPaymentStatusList = () => PAYMENT_STATUSES.slice()
export const getPaymentTypeList = () => PAYMENT_TYPES.slice()

// --- חודש תשלום: תומך גם ב-"MM-YYYY" (הקיים ב-MonthYearPicker) וגם ב-"YYYY-MM" ---
export function toYearMonth(v) {
  const s = String(v || '').trim()
  if (!s) return ''
  const parts = s.split('-')
  if (parts.length !== 2) return ''
  const [p1, p2] = parts.map((x) => String(x).trim())

  // YYYY-MM
  if (p1.length === 4) return `${p1}-${String(p2).padStart(2, '0')}`

  // MM-YYYY
  if (p2.length === 4) return `${p2}-${String(p1).padStart(2, '0')}`

  return ''
}
