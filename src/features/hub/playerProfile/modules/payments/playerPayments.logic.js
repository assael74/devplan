// src/features/players/payments/playerPayments.logic.js
import moment from 'moment'
import { getPaymentStatusMeta, getPaymentTypeMeta, isPaymentOpen, toYearMonth } from '../../../../../shared/payments/payments.utils'

// --- עזר ---
function toNum(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function pickId(p, idx) {
  return String(p?.id || p?.paymentId || `${idx}`)
}

// --- נורמליזציה: תומך במבנים ישנים + חדשים ---
export function normalizePlayerPayments(player) {
  const src = Array.isArray(player?.payments) ? player.payments : []
  const parents = Array.isArray(player?.parents) ? player.parents : []

  return src.map((p, idx) => {
    const statusId = String(p?.status?.id || p?.status || 'new')
    const statusTime = String(p?.status?.time || p?.statusTime || '')
    const ym = toYearMonth(p?.dueMonth || p?.paymentFor || p?.month || '')

    const payerParentId = String(p?.payerParentId || p?.parentId || '')
    const parent = payerParentId ? parents.find((x) => String(x?.id) === payerParentId) : null

    return {
      id: pickId(p, idx),

      // --- שיוך ---
      playerId: String(p?.playerId || player?.id || ''),
      teamId: String(p?.teamId || player?.teamId || ''),
      clubId: String(p?.clubId || player?.clubId || ''),

      // --- כספי ---
      price: toNum(p?.price ?? p?.amount ?? 0),

      // --- תיאור/סוג ---
      type: String(p?.type || 'monthlyPayment'),
      paymentFor: String(p?.paymentFor || p?.title || ''),
      dueMonth: ym,

      // --- סטטוס ---
      status: { id: statusId, time: statusTime || moment().format('DD/MM/YYYY') },

      // --- משלם ---
      payerParentId: payerParentId || '',
      payerName: parent?.parentName || String(p?.payerName || ''),

      // --- מטא ---
      createdAt: p?.createdAt || null,
      raw: p,
      meta: {
        status: getPaymentStatusMeta(statusId),
        type: getPaymentTypeMeta(p?.type),
        isOpen: isPaymentOpen(statusId),
      },
    }
  })
}

// --- חישוב סיכום לקלפי KPI ---
export function buildPaymentsSummary(list) {
  const items = Array.isArray(list) ? list : []
  let done = 0
  let open = 0
  let invoice = 0

  for (const p of items) {
    const sid = p?.status?.id
    const amt = toNum(p?.price)
    if (sid === 'done') done += amt
    else if (sid === 'invoice') invoice += amt
    else open += amt // new ועוד
  }

  return {
    done,
    open,
    invoice,
    total: done + open + invoice,
  }
}

// --- פילטרים ---
export function applyPaymentsFilters(list, filters) {
  const items = Array.isArray(list) ? list : []
  const f = filters || {}

  const ym = toYearMonth(f?.dueMonth)
  const statusId = String(f?.statusId || '')
  const typeId = String(f?.typeId || '')
  const parentId = String(f?.payerParentId || '')
  const teamId = String(f?.teamId || '')

  return items.filter((p) => {
    if (ym && p.dueMonth !== ym) return false
    if (statusId && statusId !== 'all' && p?.status?.id !== statusId) return false
    if (typeId && typeId !== 'all' && p?.type !== typeId) return false
    if (parentId && parentId !== 'all' && p?.payerParentId !== parentId) return false
    if (teamId && teamId !== 'all' && p?.teamId !== teamId) return false
    return true
  })
}

// --- הכנסות לפי חודש (groupBy dueMonth) ---
export function buildMonthlyIncomeAgg(list) {
  const items = Array.isArray(list) ? list : []
  const map = {}

  for (const p of items) {
    const ym = p?.dueMonth || ''
    if (!ym) continue
    if (!map[ym]) map[ym] = { dueMonth: ym, done: 0, open: 0, invoice: 0, total: 0 }

    const amt = toNum(p?.price)
    const sid = p?.status?.id

    if (sid === 'done') map[ym].done += amt
    else if (sid === 'invoice') map[ym].invoice += amt
    else map[ym].open += amt

    map[ym].total += amt
  }

  return Object.values(map).sort((a, b) => String(a.dueMonth).localeCompare(String(b.dueMonth)))
}

// --- אופציות פילטרים (ללא תלות בשרת) ---
export function buildPaymentsFilterOptions(player, list) {
  const items = Array.isArray(list) ? list : []
  const parents = Array.isArray(player?.parents) ? player.parents : []

  const months = Array.from(new Set(items.map((p) => p.dueMonth).filter(Boolean))).sort()
  const parentOptions = parents
    .map((p) => ({ id: String(p?.id || ''), label: p?.parentName || 'הורה' }))
    .filter((x) => x.id)

  return { months, parentOptions }
}
