// src/features/hub/teamProfile/sharedUi/insights/teamPlayers/buildSection/buildSection.ui.js

const emptyArray = []

export const toNum = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export const getCount = (card = {}) => {
  return toNum(
    card.count ??
    card.valueRaw ??
    card.value
  )
}

export const getMin = (card = {}) => {
  return toNum(
    card.minTarget ??
    card.target?.min ??
    card.target?.target?.min
  )
}

export const getMax = (card = {}) => {
  return toNum(
    card.maxTarget ??
    card.target?.max ??
    card.target?.target?.max
  )
}

export const getStatus = (card = {}) => {
  const count = getCount(card)
  const min = getMin(card)
  const max = getMax(card)

  if (max && count > max) return 'over'
  if (min && count < min) return 'under'

  return card.status || 'ok'
}

const getTone = (status) => {
  if (status === 'over' || status === 'under') return 'warning'
  if (status === 'ok') return 'success'

  return 'neutral'
}

export const getPlayers = (card = {}) => {
  if (Array.isArray(card.players)) return card.players
  if (Array.isArray(card.tooltip?.players)) return card.tooltip.players
  if (Array.isArray(card.tooltip?.rows)) return card.tooltip.rows

  return emptyArray
}

export const isBadCard = (card = {}) => {
  const status = getStatus(card)

  return (
    card.color === 'warning' ||
    card.tone === 'warning' ||
    status === 'over' ||
    status === 'under' ||
    card.rangeStatus === 'high' ||
    card.rangeStatus === 'low'
  )
}

export const getDefaultCard = (cards = emptyArray) => {
  return (
    cards.find(isBadCard) ||
    cards[0] ||
    null
  )
}

export const getAspectCards = ({ id, cards = {}, positionMode = 'primary' }) => {
  if (id === 'squadRole') {
    return cards.roles || emptyArray
  }

  if (id === 'positions') {
    if (positionMode === 'coverage') {
      return (
        cards.positionsCoverage ||
        cards.positionsAll ||
        cards.positions ||
        emptyArray
      )
    }

    return (
      cards.positionsPrimary ||
      cards.positionsExact ||
      cards.positions ||
      emptyArray
    )
  }

  return emptyArray
}

export const getAspectStatus = (cards = emptyArray) => {
  if (cards.some(isBadCard)) {
    return {
      label: 'דורש בדיקה',
      color: 'warning',
    }
  }

  if (cards.length) {
    return {
      label: 'מאוזן',
      color: 'success',
    }
  }

  return {
    label: 'אין נתונים',
    color: 'neutral',
  }
}

const getTitle = ({ card, type, status }) => {
  const label = card?.label || 'פריט נבחר'
  const isPosition = type === 'position'

  if (status === 'over') {
    return isPosition
      ? `עומס בעמדת ${label}`
      : `עומס ב${label}`
  }

  if (status === 'under') {
    return isPosition
      ? `חוסר בעמדת ${label}`
      : `חוסר ב${label}`
  }

  return `${label} בטווח תקין`
}

const getText = (card = {}) => {
  const count = getCount(card)
  const min = getMin(card)
  const max = getMax(card)

  if (min || max) {
    return `${count} שחקנים בפועל מול יעד ${min}–${max}.`
  }

  return `${count} שחקנים בפועל.`
}

const toDetail = (item, index) => {
  if (!item) return null

  if (typeof item === 'string') {
    return {
      id: `tooltip-${index}`,
      label: 'פירוט',
      text: item,
    }
  }

  return {
    id: item.id || item.label || `tooltip-${index}`,
    label: item.label || item.title || '',
    text: item.text || item.value || item.sub || '',
  }
}

const getTooltipDetails = (tooltip) => {
  if (!tooltip) return emptyArray

  if (Array.isArray(tooltip)) {
    return tooltip.map(toDetail).filter(Boolean)
  }

  if (Array.isArray(tooltip.items)) {
    return tooltip.items.map(toDetail).filter(Boolean)
  }

  if (Array.isArray(tooltip.details)) {
    return tooltip.details.map(toDetail).filter(Boolean)
  }

  if (Array.isArray(tooltip.rows)) {
    return tooltip.rows.map(toDetail).filter(Boolean)
  }

  const details = [
    tooltip.title || tooltip.label
      ? {
          id: 'tooltip-title',
          label: tooltip.title || tooltip.label,
          text: tooltip.text || tooltip.sub || '',
        }
      : null,

    tooltip.meaning
      ? {
          id: 'meaning',
          label: 'משמעות מקצועית',
          text: tooltip.meaning,
        }
      : null,

    tooltip.action
      ? {
          id: 'action',
          label: 'פעולה מומלצת',
          text: tooltip.action,
        }
      : null,
  ]

  return details.filter((item) => item?.text || item?.label)
}

const getFallbackDetails = ({ type, status }) => {
  const isPosition = type === 'position'

  const meaning =
    status === 'over'
      ? isPosition
        ? 'יש ריכוז גבוה מדי בעמדה, מה שעלול ליצור עומס תחרותי וחוסר איזון בסגל.'
        : 'יש יותר מדי שחקנים באותו מעמד, מה שמקשה על היררכיה ברורה וחלוקת דקות.'
      : status === 'under'
        ? isPosition
          ? 'אין מספיק כיסוי טבעי לעמדה, ולכן פציעה או עומס עלולים לייצר בעיית עומק.'
          : 'חסרה שכבה בסגל, ולכן חלוקת התפקידים והציפיות לא מאוזנת.'
        : 'המבנה נראה מאוזן ביחס ליעד שהוגדר.'

  const action =
    status === 'over'
      ? isPosition
        ? 'בדוק האם חלק מהשחקנים יכולים להיות משויכים לעמדה ראשית אחרת.'
        : 'בדוק מי באמת מקבל דקות והשפעה בהתאם למעמד, ואת היתר שקול להעביר למעמד נמוך יותר.'
      : status === 'under'
        ? isPosition
          ? 'בדוק הסבה פנימית, קידום שחקן או צורך בגיוס לעמדה.'
          : 'בדוק האם יש שחקנים שמתאימים לקידום למעמד החסר.'
        : 'אין צורך בפעולה מיידית, רק מעקב שוטף.'

  return [
    {
      id: 'meaning',
      label: 'משמעות מקצועית',
      text: meaning,
    },
    {
      id: 'action',
      label: 'פעולה מומלצת',
      text: action,
    },
  ]
}

export const buildTakeaway = ({ card, type = 'role' }) => {
  if (!card) return null

  const status = getStatus(card)
  const tooltipDetails = getTooltipDetails(card.tooltip)

  return {
    item: {
    id: card.id,
    actionLabel: getTitle({
      card,
      type,
      status,
    }),
    text: getText(card),
    tone: getTone(status),
  },

    details: tooltipDetails.length
      ? tooltipDetails
      : getFallbackDetails({
          type,
          status,
        }),
  }
}

export const buildViewCards = ({ cards = emptyArray, selectedCard, onSelect, }) => {
  return cards.map((card) => {
    return {
      ...card,
      selected: selectedCard?.id === card.id,
      onClick: () => {
        onSelect(card.id)
      },
    }
  })
}

export const buildAspectBlockModel = ({
  id,
  type = 'role',
  cards = {},
  selectedId = null,
  onSelect,
  positionMode = 'primary',
}) => {
  const aspectCards = getAspectCards({
    id,
    cards,
    positionMode,
  })

  const selectedCard =
    aspectCards.find((card) => card.id === selectedId) ||
    getDefaultCard(aspectCards)

  const status = getAspectStatus(aspectCards)

  const selectedTakeaway = buildTakeaway({
    card: selectedCard,
    type,
  })

  const viewCards = buildViewCards({
    cards: aspectCards,
    selectedCard,
    onSelect,
  })

  return {
    cards: viewCards,
    selectedCard,
    selectedTakeaway,
    status,
  }
}
