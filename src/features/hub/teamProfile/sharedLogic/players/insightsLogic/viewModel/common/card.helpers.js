// teamProfile/sharedLogic/players/viewModel/common/card.helpers.js

export const emptyArray = []

export const pct = (part, total) => {
  const a = Number(part) || 0
  const b = Number(total) || 0

  if (!b) return 0

  return Math.round((a / b) * 100)
}

export const getTargetCountRange = ({
  active,
  target = {},
}) => {
  const minFromCount = Number(target.min)
  const maxFromCount = Number(target.max)

  const pctRange = Array.isArray(target.pctRange)
    ? target.pctRange
    : []

  const minFromPct = pctRange.length >= 2
    ? Math.round((Number(pctRange[0]) / 100) * active)
    : null

  const maxFromPct = pctRange.length >= 2
    ? Math.round((Number(pctRange[1]) / 100) * active)
    : null

  const min = Number.isFinite(minFromPct)
    ? Math.max(minFromCount || 0, minFromPct)
    : minFromCount || 0

  const max = Number.isFinite(maxFromPct)
    ? Math.min(maxFromCount || maxFromPct, maxFromPct)
    : maxFromCount || 0

  return {
    min,
    max,
  }
}
