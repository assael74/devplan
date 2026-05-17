// teamProfile/sharedLogic/games/insightsLogic/print/printSections.model.js

import { buildHomeAwayCardsModel } from '../viewModel/cards/homeAwayCards.model.js'
import { buildDifficultyCardsModel } from '../viewModel/cards/difficultyCards.model.js'
import { buildSquadCardsModel } from '../viewModel/cards/squadCards.model.js'
import { buildSquadOffenseCardsModel } from '../viewModel/cards/squadOffenseCards.model.js'

import {
  asArray,
  emptyText,
  getInsightText,
  getText,
  hasRealValue,
} from './print.utils.js'

const normalizeMetricCard = (card = {}) => {
  return {
    id: getText(card?.id, card?.key, card?.label),
    title: getText(card?.label, card?.title, emptyText),
    value: getText(card?.value),
    sub: getText(card?.sub),
    color: getText(card?.color, 'neutral'),
    icon: getText(card?.icon),
  }
}

const normalizeMetricCards = (cards) => {
  return asArray(cards)
    .map(normalizeMetricCard)
    .filter((card) => {
      return (
        hasRealValue(card.title) &&
        (
          hasRealValue(card.value) ||
          hasRealValue(card.sub)
        )
      )
    })
}

const normalizeProjectionCard = (projection) => {
  if (!projection) return null

  const value = getText(projection?.value)
  const sub = getText(projection?.sub)

  if (!hasRealValue(value) && !hasRealValue(sub)) return null

  return {
    id: 'projection',
    title: getText(projection?.title, 'תחזית'),
    value,
    sub,
    color: getText(projection?.color, 'primary'),
    icon: getText(projection?.icon, 'projection'),
    isProjection: true,
  }
}

const buildTriadCardsSection = ({
  id,
  title,
  current,
  insight,
  projection,
  currentColumns = 2,
}) => {
  return {
    id,
    variant: 'triadCards',
    title,
    current: {
      title: current?.title || 'מצב עד עכשיו',
      cards: normalizeMetricCards(current?.cards),
      columns: currentColumns,
    },
    insight: {
      title: insight?.actionLabel || insight?.label || 'מוקד פעולה',
      text: getInsightText(insight),
      color: getText(insight?.tone, 'neutral'),
    },
    projection: {
      title: getText(projection?.title, 'תחזית'),
      value: getText(projection?.value),
      sub: getText(projection?.sub),
      color: getText(projection?.color, 'primary'),
    },
  }
}

const buildMetricCardsSection = ({
  id,
  title,
  subtitle = '',
  projection = null,
  cards = [],
  insight = null,
  columns = 2,
}) => {
  const projectionCard = normalizeProjectionCard(projection)
  const metricCards = normalizeMetricCards(cards)

  return {
    id,
    variant: 'metricCards',
    title: getText(title, emptyText),
    subtitle: getText(subtitle),
    columns,
    cards: [
      ...(projectionCard ? [projectionCard] : []),
      ...metricCards,
    ],
    takeaway: {
      title: insight?.actionLabel || 'מוקד פעולה',
      text: getInsightText(insight),
    },
  }
}

const buildHomeAwaySection = ({ model, briefSections }) => {
  const sectionModel = buildHomeAwayCardsModel({
    data: model?.homeAwayProjection,
    brief: briefSections?.homeAway,
  })

  return buildTriadCardsSection({
    id: 'homeAway',
    title: 'פילוח בית / חוץ',
    current: sectionModel.current,
    insight: sectionModel.insight,
    projection: sectionModel.projection,
    currentColumns: 2,
  })
}

const buildDifficultySection = ({ model, briefSections }) => {
  const sectionModel = buildDifficultyCardsModel({
    data: model?.difficultyProjection,
    brief: briefSections?.difficulty,
  })

  return buildTriadCardsSection({
    id: 'difficulty',
    title: 'פילוח לפי רמת קושי',
    current: sectionModel.current,
    insight: sectionModel.insight,
    projection: sectionModel.projection,
    currentColumns: 3,
  })
}

const buildSquadOffenseSection = ({ briefSections }) => {
  const sectionModel = buildSquadOffenseCardsModel({
    brief: briefSections?.squad,
  })

  return buildMetricCardsSection({
    id: 'squadOffense',
    title: sectionModel.title,
    subtitle: sectionModel.subtitle,
    cards: sectionModel.cards,
    insight: sectionModel.insight,
    columns: 3,
  })
}

const buildSquadUsageSections = ({ model, briefSections }) => {
  const sectionModel = buildSquadCardsModel({
    data: model?.squadMetrics,
    brief: briefSections?.squad,
  })

  return [
    buildMetricCardsSection({
      id: 'squadLineup',
      title: sectionModel.lineup?.title,
      subtitle: sectionModel.lineup?.subtitle,
      cards: sectionModel.lineup?.cards,
      insight: sectionModel.lineup?.insight,
      columns: 2,
    }),
    buildMetricCardsSection({
      id: 'squadIntegration',
      title: sectionModel.integration?.title,
      subtitle: sectionModel.integration?.subtitle,
      cards: sectionModel.integration?.cards,
      insight: sectionModel.integration?.insight,
      columns: 2,
    }),
  ]
}

const keepSection = (section) => {
  if (!section) return false

  if (section.variant === 'triadCards') {
    return (
      asArray(section?.current?.cards).length ||
      hasRealValue(section?.insight?.text) ||
      hasRealValue(section?.projection?.value)
    )
  }

  if (section.variant === 'metricCards') {
    return (
      asArray(section.cards).length ||
      hasRealValue(section?.takeaway?.text)
    )
  }

  return false
}

export const buildPrintSections = ({
  model,
  briefSections,
}) => {
  return [
    buildHomeAwaySection({
      model,
      briefSections,
    }),
    buildDifficultySection({
      model,
      briefSections,
    }),
    buildSquadOffenseSection({
      briefSections,
    }),
    ...buildSquadUsageSections({
      model,
      briefSections,
    }),
  ].filter(keepSection)
}
