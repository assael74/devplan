// playerProfile/sharedLogic/games/insightsDrawer/print/print.utils.js

const emptyText = '—'

const toNumber = (value) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

export const cleanPrintText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback

  const text = String(value).trim()

  return text || fallback
}

export const normalizePrintValue = (value, fallback = emptyText) => {
  if (value === null || value === undefined || value === '') return fallback

  return String(value)
}

export const getPrintPlayerName = (player = {}) => {
  return cleanPrintText(
    player.playerFullName ||
    player.fullName ||
    player.name ||
    player.playerName,
    'שחקן'
  )
}

export const getPrintTeamName = (team = {}) => {
  return cleanPrintText(
    team.teamName ||
    team.name ||
    team.title,
    ''
  )
}

export const formatPrintNumber = (value, digits = 0, fallback = emptyText) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return fallback

  return number.toLocaleString('he-IL', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export const formatPrintPercent = (value, digits = 0, fallback = emptyText) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return fallback

  return `${formatPrintNumber(number, digits, fallback)}%`
}

export const formatPrintRange = (range = [], fallback = 'לא הוגדר יעד') => {
  if (!Array.isArray(range) || range.length < 2) return fallback

  const min = toNumber(range[0])
  const max = toNumber(range[1])

  if (min === null || max === null) return fallback

  return `${formatPrintNumber(min)}%–${formatPrintNumber(max)}%`
}

export const normalizePrintColor = (color, fallback = 'neutral') => {
  if (color === 'success') return 'success'
  if (color === 'warning') return 'warning'
  if (color === 'danger') return 'danger'
  if (color === 'primary') return 'primary'
  if (color === 'neutral') return 'neutral'

  return fallback
}

export const resolveTargetAchievementColor = ({
  actual,
  target,
  higherIsBetter = true,
  goodRatio = 1,
  warningRatio = 0.7,
  overTargetColor = 'success',
  fallback = 'neutral',
}) => {
  const actualNumber = toNumber(actual)
  const targetNumber = toNumber(target)

  if (actualNumber === null || targetNumber === null || targetNumber <= 0) {
    return fallback
  }

  const ratio = actualNumber / targetNumber

  if (higherIsBetter) {
    if (ratio >= goodRatio) return overTargetColor
    if (ratio >= warningRatio) return 'warning'

    return 'danger'
  }

  if (ratio <= 1) return 'success'
  if (ratio <= 1.2) return 'warning'

  return 'danger'
}

export const resolveTargetRangeColor = ({
  actual,
  range = [],
  fallback = 'neutral',
}) => {
  const actualNumber = toNumber(actual)

  if (actualNumber === null) return fallback
  if (!Array.isArray(range) || range.length < 2) return fallback

  const min = toNumber(range[0])
  const max = toNumber(range[1])

  if (min === null || max === null) return fallback

  if (actualNumber >= min && actualNumber <= max) return 'success'
  if (actualNumber < min * 0.7) return 'danger'
  if (actualNumber < min) return 'warning'

  return 'primary'
}

export const normalizePrintCard = (card = {}) => {
  return {
    id: card.id || card.key || card.title || card.label,
    title: cleanPrintText(
      card.title ||
      card.label ||
      card.name,
      'מדד'
    ),
    value: normalizePrintValue(
      card.value ??
      card.mainValue ??
      card.valueLabel
    ),
    sub: cleanPrintText(
      card.sub ||
      card.subtitle ||
      card.subValue ||
      card.description
    ),
    icon: card.icon || card.idIcon || 'info',
    color: normalizePrintColor(card.color || card.tone),
    level: card.level || 'medium',
    tooltip: card.tooltip || null,
    raw: card.raw || card,
  }
}

export const normalizePrintCards = (cards = []) => {
  if (!Array.isArray(cards)) return []

  return cards
    .filter(Boolean)
    .map(normalizePrintCard)
}

export const buildPrintMetaItem = ({
  id,
  label,
  value,
  color = 'neutral',
}) => {
  return normalizePrintCard({
    id,
    title: label,
    value,
    color,
  })
}

export const pickPrimaryBriefText = (brief = {}) => {
  const items = Array.isArray(brief?.items) ? brief.items : []

  const item =
    items.find((row) => row?.id === 'action_focus') ||
    items.find((row) => row?.type === 'focus') ||
    items.find((row) => row?.type === 'risk') ||
    items.find((row) => row?.type === 'advantage') ||
    items[0]

  return cleanPrintText(
    item?.text ||
    brief?.text ||
    brief?.summary ||
    brief?.takeaway ||
    ''
  )
}

export const pickBriefTitle = (brief = {}, fallback = 'תובנה') => {
  return cleanPrintText(
    brief.title ||
    brief.label ||
    fallback,
    fallback
  )
}

export const buildPrintSection = ({
  id,
  title,
  summary = '',
  cards = [],
  color = 'neutral',
}) => {
  return {
    id,
    title: cleanPrintText(title, 'תובנה'),
    summary: cleanPrintText(summary),
    color: normalizePrintColor(color),
    cards: normalizePrintCards(cards),
  }
}
