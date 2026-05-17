// teamProfile/sharedLogic/players/insightsLogic/viewModel/build/position.model.js

const emptyArray = []

const ATTACK_POSITION_LAYERS = [
  'attack',
  'atMidfield',
  'midfield',
]

const DEFENSE_POSITION_LAYERS = [
  'dmMid',
  'defense',
  'goalkeeper',
]

export const positionStatusMeta = {
  under: {
    label: 'חוסר',
    color: 'warning',
  },
  over: {
    label: 'עומס',
    color: 'danger',
  },
  keyOverload: {
    label: 'ריבוי מפתח',
    color: 'danger',
  },
  ok: {
    label: 'תקין',
    color: 'success',
  },
  neutral: {
    label: 'ללא הערכה',
    color: 'neutral',
  },
}

export const getPositionStatus = (card = {}) => {
  return card.rangeStatus || card.status || 'neutral'
}

export const isPositionAlertCard = (card = {}) => {
  const status = getPositionStatus(card)

  return (
    status === 'under' ||
    status === 'over' ||
    status === 'keyOverload' ||
    card.color === 'warning' ||
    card.color === 'danger'
  )
}

const getLayerCards = ({ cards, layers}) => {
  return cards.filter((card) => {
    return layers.includes(card.layerKey)
  })
}

const splitCardsByStatus = (cards = emptyArray) => {
  const safeCards = Array.isArray(cards) ? cards : emptyArray

  return {
    alerts: safeCards.filter(isPositionAlertCard),
    normal: safeCards.filter((card) => !isPositionAlertCard(card)),
  }
}

const buildLayerModel = ({
  id,
  title,
  icon,
  cards,
}) => {
  const { alerts, normal } = splitCardsByStatus(cards)

  return {
    id,
    title,
    icon,
    cards,
    alerts,
    normal,
    total: cards.length,
    alertCount: alerts.length,
    normalCount: normal.length,
  }
}

export const buildPositionLayersModel = (cards = emptyArray) => {
  const safeCards = Array.isArray(cards) ? cards : emptyArray

  return [
    buildLayerModel({
      id: 'attack',
      title: 'שכבת התקפה',
      icon: 'attack',
      cards: getLayerCards({
        cards: safeCards,
        layers: ATTACK_POSITION_LAYERS,
      }),
    }),

    buildLayerModel({
      id: 'defense',
      title: 'שכבת הגנה',
      icon: 'defense',
      cards: getLayerCards({
        cards: safeCards,
        layers: DEFENSE_POSITION_LAYERS,
      }),
    }),
  ].filter((layer) => layer.total > 0)
}

export const isSelectedInPositionLayer = ({ layer, selectedCard }) => {
  if (!selectedCard?.id) return false

  return layer.cards.some((card) => {
    return card.id === selectedCard.id
  })
}
