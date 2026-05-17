// playerProfile/sharedUi/insights/playerGames/print/printView.helpers.js

const emptyText = '—'

export const cleanPrintText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback

  const text = String(value).trim()

  return text || fallback
}

export const getPrintValue = (value, fallback = emptyText) => {
  return cleanPrintText(value, fallback)
}

export const getCardKey = (card = {}, index = 0) => {
  return card.id || card.key || card.title || card.label || `card-${index}`
}

export const getSectionKey = (section = {}, index = 0) => {
  return section.id || section.key || section.title || `section-${index}`
}

export const getCardTitle = (card = {}) => {
  return cleanPrintText(card.title || card.label, 'מדד')
}

export const getCardValue = (card = {}) => {
  return getPrintValue(card.value)
}

export const getCardSub = (card = {}) => {
  return cleanPrintText(card.sub || card.subtitle || card.description)
}

export const getSectionTitle = (section = {}) => {
  return cleanPrintText(section.title, 'תובנה')
}

export const getSectionSummary = (section = {}) => {
  return cleanPrintText(section.summary || section.text || section.description)
}

export const hasCards = (cards) => {
  return Array.isArray(cards) && cards.length > 0
}

export const hasText = (value) => {
  return cleanPrintText(value).length > 0
}

export const normalizePrintColor = (color) => {
  if (color === 'success') return 'success'
  if (color === 'warning') return 'warning'
  if (color === 'danger') return 'danger'
  if (color === 'primary') return 'primary'

  return 'neutral'
}

const toneMap = {
  success: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
    titleColor: '#166534',
    valueColor: '#14532d',
  },

  warning: {
    borderColor: '#fed7aa',
    backgroundColor: '#fff7ed',
    titleColor: '#9a3412',
    valueColor: '#7c2d12',
  },

  danger: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    titleColor: '#991b1b',
    valueColor: '#7f1d1d',
  },

  primary: {
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    titleColor: '#1d4ed8',
    valueColor: '#1e3a8a',
  },

  neutral: {
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    titleColor: '#6b7280',
    valueColor: '#111827',
  },
}

export const getPrintTone = (color) => {
  const key = normalizePrintColor(color)

  return toneMap[key] || toneMap.neutral
}

export const getPrintToneSx = (color) => {
  const tone = getPrintTone(color)

  return {
    borderColor: tone.borderColor,
    bgcolor: tone.backgroundColor,
  }
}

export const getPrintToneTitleSx = (color) => {
  const tone = getPrintTone(color)

  return {
    color: tone.titleColor,
  }
}

export const getPrintToneValueSx = (color) => {
  const tone = getPrintTone(color)

  return {
    color: tone.valueColor,
  }
}
