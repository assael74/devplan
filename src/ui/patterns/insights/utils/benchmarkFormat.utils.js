// ui/patterns/insights/utils/benchmarkFormat.utils.js

const toneColor = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  primary: 'primary',
  neutral: 'neutral',
}

export function normalizeTone(value, fallback = 'neutral') {
  return toneColor[value] || fallback
}

export function formatNumber(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'

  return String(Math.round(n))
}

export function formatPercent(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'

  return `${Math.round(n)}%`
}

export function formatActual(row) {
  const suffix = row?.suffix || ''
  const value = row?.value

  if (suffix === '%') {
    return formatPercent(value)
  }

  return `${formatNumber(value)}${suffix}`
}

export function formatTarget(row) {
  const target = row?.target || {}
  const suffix = row?.suffix || ''

  if (Array.isArray(target.greenRange)) {
    return `${target.greenRange[0]}%–${target.greenRange[1]}%`
  }

  if (target.greenMin !== undefined && target.greenMin !== null) {
    return `לפחות ${target.greenMin}${suffix}`
  }

  if (target.greenMax !== undefined && target.greenMax !== null) {
    return `עד ${target.greenMax}${suffix}`
  }

  return '—'
}

export function formatStatus(row) {
  const status = row?.evaluation?.status

  if (status === 'green') return 'עומד ביעד'
  if (status === 'red') return 'פער מהיעד'
  if (status === 'watch') return 'אזור ביניים'

  return 'ללא הערכה'
}

export function getRowTone(row, fallback = 'neutral') {
  return normalizeTone(row?.evaluation?.tone, fallback)
}
