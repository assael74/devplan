// src/features/players/components/preview/PreviewDomainCard/domains/payments/payments.domain.logic.js
import { DOMAIN_STATE } from '../../../../preview.state'

const safe = (v) => (v == null ? '' : String(v))
const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

const normStatus = (s) => safe(s?.id || s).toLowerCase()

export const resolvePaymentsDomain = (player, paymentsById) => {
  const ids = Array.isArray(player?.playerPaymentsId) ? player.playerPaymentsId : []
  const items = ids.map((id) => paymentsById?.[id]).filter(Boolean)

  const count = items.length
  let state = DOMAIN_STATE.EMPTY
  if (count === 0) state = DOMAIN_STATE.EMPTY
  else if (items.some((p) => !safe(p?.paymentFor).trim() || !n(p?.price))) state = DOMAIN_STATE.PARTIAL
  else state = DOMAIN_STATE.OK

  return { count, state, items }
}

const mmYYYYtoKey = (s) => {
  const t = safe(s).trim()
  // תומך "10-2025" או "2025-10"
  if (/^\d{2}-\d{4}$/.test(t)) return t
  if (/^\d{4}-\d{2}$/.test(t)) return `${t.slice(5, 7)}-${t.slice(0, 4)}`
  return t || ''
}

const comparePeriod = (a, b) => {
  // "MM-YYYY" → YYYYMM
  const toNum = (x) => {
    const k = mmYYYYtoKey(x)
    const [mm, yy] = k.split('-')
    const y = Number(yy)
    const m = Number(mm)
    if (!y || !m) return 0
    return y * 100 + m
  }
  return toNum(a) - toNum(b)
}

export const buildPaymentsCardKpis = (payments = []) => {
  const items = Array.isArray(payments) ? payments : []

  const done = items.filter((p) => normStatus(p?.status) === 'done' || normStatus(p?.status) === 'paid')
  const open = items.filter((p) => !normStatus(p?.status) || normStatus(p?.status) === 'open' || normStatus(p?.status) === 'planned')

  const lastPaid = done
    .slice()
    .sort((a, b) => comparePeriod(a?.paymentFor, b?.paymentFor) * -1)[0]

  const nextOpen = open
    .slice()
    .sort((a, b) => comparePeriod(a?.paymentFor, b?.paymentFor))[0]

  const sumAll = items.reduce((acc, p) => acc + n(p?.price), 0)
  const sumOpen = open.reduce((acc, p) => acc + n(p?.price), 0)

  return {
    count: items.length,
    doneCount: done.length,
    openCount: open.length,
    sumAll,
    sumOpen,
    lastPaidLabel: lastPaid
      ? `${mmYYYYtoKey(lastPaid.paymentFor)} • ₪${n(lastPaid.price)}`
      : '—',
    nextOpenLabel: nextOpen
      ? `${mmYYYYtoKey(nextOpen.paymentFor)} • ₪${n(nextOpen.price)}`
      : 'אין',
    hasOpen: open.length > 0,
  }
}
