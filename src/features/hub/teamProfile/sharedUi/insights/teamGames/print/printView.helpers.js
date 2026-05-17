// teamProfile/sharedUi/insights/teamGames/print/printView.helpers.js

const emptyValue = 'לא זמין'

export const hasText = (value) => {
  if (value === null || value === undefined) return false

  const text = String(value).trim()

  if (!text) return false
  if (text === emptyValue) return false
  if (text === '[object Object]') return false

  return true
}

export const getPrintCardToneSx = (color = 'neutral') => {
  const tones = {
    success: {
      backgroundColor: '#eefbf1',
      borderColor: '#b7e4c7',
    },
    primary: {
      backgroundColor: '#eef4ff',
      borderColor: '#bcd2ff',
    },
    warning: {
      backgroundColor: '#fff7e8',
      borderColor: '#f3d08b',
    },
    danger: {
      backgroundColor: '#fff0f1',
      borderColor: '#f0b8bf',
    },
    neutral: {
      backgroundColor: '#f8f9fb',
      borderColor: '#e3e6eb',
    },
  }

  return tones[color] || tones.neutral
}

export const getCardsTakeaway = (cards) => {
  const card = Array.isArray(cards)
    ? cards.find((item) => hasText(item?.takeaway))
    : null

  return card?.takeaway || ''
}
