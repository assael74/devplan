// playerProfile/sharedLogic/games/insightsDrawer/cards/playerBrief.cards.js

import {
  normalizeBriefCard,
} from './playerCards.shared.js'

const DEFAULT_BRIEFS_ORDER = [
  'usage',
  'roleFit',
  'positionFit',
  'scoring',
  'teamContext',
  'difficulty',
  'recent',
]

const getBriefsObject = (insights = {}) => {
  return insights?.briefs || insights?.sections || {}
}

export const buildPlayerBriefCards = (insights = {}) => {
  const briefs = getBriefsObject(insights)
  const order = Array.isArray(insights?.briefsOrder)
    ? insights.briefsOrder
    : DEFAULT_BRIEFS_ORDER

  return order
    .map((key) => briefs?.[key])
    .filter(Boolean)
    .map(normalizeBriefCard)
}

export const buildPlayerBriefItems = (brief = {}) => {
  return Array.isArray(brief?.items) ? brief.items : []
}
