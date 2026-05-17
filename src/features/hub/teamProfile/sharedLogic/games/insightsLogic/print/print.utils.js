// teamProfile/sharedLogic/games/insightsLogic/print/print.utils.js

export const emptyText = 'לא זמין'

export const getText = (...values) => {
  const value = values.find((item) => {
    if (item === null || item === undefined) return false
    if (typeof item === 'object') return false

    return String(item).trim() !== ''
  })

  return value === null || value === undefined ? '' : String(value).trim()
}

export const asArray = (value) => {
  return Array.isArray(value) ? value : []
}

export const hasRealValue = (value) => {
  const text = getText(value)

  if (!text) return false
  if (text === emptyText) return false

  return true
}

export const formatNumber = (value) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return ''

  if (Number.isInteger(number)) return String(number)

  return number.toFixed(1)
}

export const formatPct = (value) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return ''

  return `${Math.round(number)}%`
}

export const getInsightText = (insight = {}) => {
  return getText(insight?.text, insight?.summary, insight?.label)
}

export const getBriefText = (brief = {}) => {
  return getText(brief?.text, brief?.title)
}
