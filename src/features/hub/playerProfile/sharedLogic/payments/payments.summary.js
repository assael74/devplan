//  playerProfile/sharedLogic/payments/payments.summary.js

function toNum(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function buildPaymentsSummary(items) {
  const list = Array.isArray(items) ? items : []

  let done = 0
  let open = 0
  let invoice = 0

  for (const payment of list) {
    const statusId = payment?.status?.id
    const amount = toNum(payment?.price)

    if (statusId === 'done') {
      done += amount
      continue
    }

    if (statusId === 'invoice') {
      invoice += amount
      continue
    }

    open += amount
  }

  return {
    done,
    open,
    invoice,
    total: done + open + invoice,
  }
}

export function buildMonthlyIncomeAgg(items) {
  const list = Array.isArray(items) ? items : []
  const map = {}

  for (const payment of list) {
    const dueMonth = payment?.dueMonth || ''
    if (!dueMonth) continue

    if (!map[dueMonth]) {
      map[dueMonth] = {
        dueMonth,
        done: 0,
        open: 0,
        invoice: 0,
        total: 0,
      }
    }

    const amount = toNum(payment?.price)
    const statusId = payment?.status?.id

    if (statusId === 'done') map[dueMonth].done += amount
    else if (statusId === 'invoice') map[dueMonth].invoice += amount
    else map[dueMonth].open += amount

    map[dueMonth].total += amount
  }

  return Object.values(map).sort((a, b) => String(a.dueMonth).localeCompare(String(b.dueMonth)))
}
