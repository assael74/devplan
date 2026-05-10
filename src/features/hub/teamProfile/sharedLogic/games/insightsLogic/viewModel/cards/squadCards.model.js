// teamProfile/sharedLogic/games/insightsLogic/viewModel/cards/squadCards.model.js

import {
  buildUsageMetricTooltipModel,
} from '../tooltips/index.js'

import {
  formatActual,
  formatTarget,
  getRowTone,
} from '../../../../../../../../ui/patterns/insights/utils/index.js'

const iconByInsightId = {
  lineup_stability: 'lineup',
  player_integration: 'players',
}

const lineupMetricOrder = [
  'players20StartsPct',
  'top14MinutesPct',
]

const integrationMetricOrder = [
  'players500Pct',
  'players1000Pct',
]

const metricIconById = {
  players500Pct: 'isStart',
  players1000Pct: 'isStart',
  players1500Pct: 'isStart',
  players2000Pct: 'isStart',
  players20StartsPct: 'isStart',
  top14MinutesPct: 'isStart',
}

const fallbackInsights = [
  {
    id: 'lineup_stability',
    label: 'יציבות הרכב',
    actionLabel: 'המשך בדיקה',
    tone: 'neutral',
    value: '—',
    text: 'כאן תופיע תובנה על יציבות ההרכב, עומק הרוטציה ושחקני מפתח.',
    details: [],
  },
  {
    id: 'player_integration',
    label: 'שילוב שחקנים',
    actionLabel: 'המשך בדיקה',
    tone: 'neutral',
    value: '—',
    text: 'כאן תופיע תובנה על כמות השחקנים שמשולבים בפועל לאורך העונה.',
    details: [],
  },
]

function getUsageRows(brief, order = []) {
  const rows = Array.isArray(brief?.metrics?.squadUsageEvaluation?.rows)
    ? brief.metrics.squadUsageEvaluation.rows
    : []

  return order
    .map((id) => rows.find((row) => row?.id === id))
    .filter(Boolean)
}

function getInsightItems(brief) {
  const items = Array.isArray(brief?.items) ? brief.items : []

  if (items.length) return items

  return fallbackInsights
}

function getInsightById(brief, id) {
  const items = getInsightItems(brief)

  return items.find((item) => item?.id === id) || null
}

function buildMetricCard(row, data) {
  return {
    id: row.id,
    label: row?.label || 'מדד',
    value: formatActual(row),
    sub: `יעד ${formatTarget(row)}`,
    icon: metricIconById[row?.id] || 'info',
    color: getRowTone(row),
    tooltip: buildUsageMetricTooltipModel(row, data),
  }
}

function buildMetricCards(rows, data) {
  return rows.map((row) => {
    return buildMetricCard(row, data)
  })
}

function buildUsageBlock({
  title,
  subtitle,
  rows,
  insight,
  data,
}) {
  return {
    title,
    subtitle,
    rows,
    cards: buildMetricCards(rows, data),
    insight,
    icon: iconByInsightId[insight?.id] || 'insights',
    empty: {
      title: 'אין נתונים להצגה',
      text: 'חסרים נתוני דקות, פתיחות או נקודות ייחוס ליעד הטבלה.',
    },
  }
}

export function buildSquadCardsModel({
  data = {},
  brief = {},
} = {}) {
  const lineupRows = getUsageRows(brief, lineupMetricOrder)
  const integrationRows = getUsageRows(brief, integrationMetricOrder)

  const lineupInsight = getInsightById(brief, 'lineup_stability')
  const integrationInsight = getInsightById(brief, 'player_integration')

  return {
    lineup: buildUsageBlock({
      title: 'יציבות הרכב',
      subtitle: 'גרעין פותח · ריכוזיות דקות',
      rows: lineupRows,
      insight: lineupInsight,
      data,
    }),
    integration: buildUsageBlock({
      title: 'שילוב שחקנים',
      subtitle: 'עומק שימוש · דקות משמעותיות',
      rows: integrationRows,
      insight: integrationInsight,
      data,
    }),
  }
}
