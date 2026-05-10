// teamProfile/sharedLogic/games/insightsLogic/viewModel/cards/squadOffenseCards.model.js

import {
  buildAttackMetricTooltipModel,
} from '../tooltips/index.js'

import {
  normalizeTone,
} from '../common/index.js'

import {
  formatActual,
  formatTarget,
  getRowTone,
} from '../../../../../../../../ui/patterns/insights/utils/index.js'

const attackMetricOrder = [
  'uniqueScorers',
  'scorers5Plus',
  'top3DependencyPct',
]

const metricIconById = {
  uniqueScorers: 'goal',
  scorers3Plus: 'attack',
  scorers5Plus: 'assists',
  scorers10Plus: 'star',
  topScorerDependencyPct: 'player',
  top3DependencyPct: 'teams',
}

function getAttackRows(brief) {
  const rows = Array.isArray(brief?.metrics?.scorersEvaluation?.rows)
    ? brief.metrics.scorersEvaluation.rows
    : []

  return attackMetricOrder
    .map((id) => rows.find((row) => row?.id === id))
    .filter(Boolean)
}

function getFallbackInsight() {
  return {
    id: 'attacking_involvement',
    label: 'מעורבות התקפית',
    actionLabel: 'המשך בדיקה',
    tone: 'neutral',
    value: '—',
    text: 'כאן תופיע תובנה על פיזור הכובשים, המבשלים והמעורבים בשערים.',
    details: [],
  }
}

function getAttackInsight(brief) {
  const items = Array.isArray(brief?.items) ? brief.items : []
  const found = items.find((item) => item?.id === 'attacking_involvement')

  if (found) return found

  return getFallbackInsight()
}

function buildMetricCard(row, brief) {
  return {
    id: row.id,
    label: row?.label || 'מדד',
    value: formatActual(row),
    sub: `יעד ${formatTarget(row)}`,
    icon: metricIconById[row?.id] || 'info',
    color: getRowTone(row),
    tooltip: buildAttackMetricTooltipModel(row, brief),
  }
}

function buildMetricCards(rows, brief) {
  return rows.map((row) => {
    return buildMetricCard(row, brief)
  })
}

function buildEmptyModel() {
  return {
    title: 'אין נתוני תרומה התקפית',
    text: 'חסרים נתוני כובשים או נקודות ייחוס ליעד הטבלה.',
  }
}

export function buildSquadOffenseCardsModel({
  brief = {},
} = {}) {
  const rows = getAttackRows(brief)
  const insight = getAttackInsight(brief)
  const color = normalizeTone(insight?.tone)

  return {
    title: 'תרומה למשחק ההתקפי',
    subtitle: 'פיזור כובשים · כובשים משמעותיים · ריכוזיות שערים',
    chipLabel: insight?.actionLabel || 'המשך בדיקה',
    chipIcon: 'attack',
    chipColor: color,
    rows,
    cards: buildMetricCards(rows, brief),
    empty: buildEmptyModel(),
    insight,
  }
}
