// teamProfile/sharedLogic/management/management.printModel.js

import {
  TEAM_TARGET_BENCHMARK_DEFAULTS,
  buildDifficultyRows,
  buildHomeAwayRows,
  buildScorersRows,
  buildSquadUsageRows,
  formatTargetValue,
} from '../../../../../../shared/teams/targets/index.js'

import { safeText } from '../domain/management.safe.js'
import { buildTargetPositionText } from '../domain/targets/index.js'

import {
  mapDifficultyRowsForPrint,
  mapGenericRowsForPrint,
  mapHomeAwayRowsForPrint,
} from './management.printRows.js'

import { buildManagementTargetsState } from '../domain/management.state.js'

const toNumber = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const pickPersonName = person => {
  return (
    person?.coachName ||
    person?.fullName ||
    person?.name ||
    [person?.firstName, person?.lastName].filter(Boolean).join(' ') ||
    ''
  )
}

const resolveCoachName = team => {
  const rules = Array.isArray(team?.rules) ? team.rules : []
  const roles = Array.isArray(team?.roles) ? team.roles : []
  const coach =
    rules.find(person => person?.type === 'coach') ||
    roles.find(person => person?.type === 'coach')

  return safeText(pickPersonName(coach), '—')
}

const resolveClubName = team => {
  return safeText(
    team?.club?.clubName ||
      team?.club?.name ||
      team?.clubName ||
      team?.club ||
      '',
    '—'
  )
}

const resolveTeamYear = team => {
  return safeText(team?.teamYear || team?.year || team?.birthYear || '', '')
}

const isCompactPrintView = options => (
  options.isMobile === true ||
  options.presentation === 'pdf'
)

const compactScorersPrintRows = rows => {
  return rows.map(row => {
    if (row.id === 'doubleDigitScorer') {
      return {
        ...row,
        label: 'דו ספרתי',
        helper: '10 עד 15 שערים',
      }
    }

    if (row.id === 'supportScorer') {
      return {
        ...row,
        label: 'משלים',
        helper: '5 עד 10 שערים',
      }
    }

    if (row.id === 'scorer') {
      return {
        ...row,
        label: 'סקורר',
        helper: 'מעל 15 שערים',
      }
    }

    return row
  })
}

const resolveTeamDisplayName = team => {
  const name = safeText(team?.teamName || team?.name || '', 'קבוצה')
  const year = resolveTeamYear(team)

  if (!year || String(name).includes(String(year))) return name

  return `${name} - ${year}`
}

const buildCalculationHelper = team => {
  const games =
    toNumber(team?.leagueNumGames) ||
    TEAM_TARGET_BENCHMARK_DEFAULTS.baselineGames

  return `מחושב לפי ${games} משחקים`
}

const buildMetrics = (values = {}, team = {}) => {
  const calculationHelper = buildCalculationHelper(team)

  return [
    { id: 'points', label: 'יעד נקודות', value: formatTargetValue(values.points) },
    { id: 'successRate', label: 'יעד אחוז הצלחה', value: formatTargetValue(values.successRate, '%') },
    { id: 'goalsFor', label: 'שערי זכות', value: formatTargetValue(values.goalsFor) },
    { id: 'goalsAgainst', label: 'שערי חובה', value: formatTargetValue(values.goalsAgainst) },
    { id: 'goalDifference', label: 'הפרש שערים', value: formatTargetValue(values.goalDifference) },
  ].map(metric => (
    ['points', 'goalsFor', 'goalsAgainst'].includes(metric.id)
      ? { ...metric, helper: calculationHelper }
      : metric
  ))
}

const getRuleTarget = rule => {
  const target = toNumber(rule?.target)
  if (target !== null) return target

  const range = Array.isArray(rule?.greenRange) ? rule.greenRange : []
  const min = toNumber(range[0])
  const max = toNumber(range[1])

  if (min !== null && max !== null) return Math.round((min + max) / 2)
  if (min !== null) return min
  if (max !== null) return max

  return 0
}

const toPlayersValue = value => {
  const players = Math.max(0, Math.round(toNumber(value) || 0))
  return players === 1 ? '1 שחקן' : `${players} שחקנים`
}

const buildSquadUsageLayerRowsForPrint = (squadUsage = {}, options = {}) => {
  const squadSize = toNumber(options.squadSize) || 24
  const over500 = getRuleTarget(squadUsage.playersOver500Minutes)
  const over1000 = getRuleTarget(squadUsage.playersOver1000Minutes)
  const over1500 = getRuleTarget(squadUsage.playersOver1500Minutes)
  const over2000 = getRuleTarget(squadUsage.playersOver2000Minutes)
  const baseRows = buildSquadUsageRows(squadUsage, options)
  const getBaseRow = id => baseRows.find(row => row.id === id) || {}
  const buildBaseRow = ({ id, value, idIcon, fallbackLabel, fallbackHelper }) => {
    const base = getBaseRow(id)

    return {
      id,
      idIcon: base.idIcon || 'flag',
      label: base.label || fallbackLabel,
      helper: base.helper || fallbackHelper,
      value,
    }
  }

  const rows = [
    buildBaseRow({
      id: 'top14MinutesSharePct',
      value: `${getRuleTarget(squadUsage.top14MinutesSharePct)}%`,
      fallbackLabel: 'נתח דקות לטופ 14',
      fallbackHelper: 'איזון עומס בין שחקני הסגל',
    }),
    buildBaseRow({
      id: 'playersOver20Starts',
      value: toPlayersValue(getRuleTarget(squadUsage.playersOver20Starts)),
      fallbackLabel: 'שחקני 20+ בהרכב',
      fallbackHelper: 'שחקני הרכב קבועים',
    }),
    buildBaseRow({
      id: 'playersOver2000Minutes',
      value: toPlayersValue(over2000),
      fallbackLabel: 'שחקני 2000+ דקות',
      fallbackHelper: 'שחקני מפתח',
    }),
    buildBaseRow({
      id: 'playersOver1500Minutes',
      value: toPlayersValue(over1500 - over2000),
      fallbackLabel: 'שחקני 1500+ דקות',
      fallbackHelper: 'שחקנים מרכזיים',
    }),
    buildBaseRow({
      id: 'playersOver1000Minutes',
      value: toPlayersValue(over1000 - over1500),
      fallbackLabel: 'שחקני 1000+ דקות',
      fallbackHelper: 'שחקני רוטציה',
    }),
    buildBaseRow({
      id: 'playersOver500Minutes',
      value: toPlayersValue(over500 - over1000),
      fallbackLabel: 'שחקני 500+ דקות',
      fallbackHelper: 'שחקני סגל',
    }),
    {
      id: 'playersUnder500Minutes',
      label: 'עד 500 דקות',
      value: toPlayersValue(squadSize - over500),
      helper: `משלים ל-${squadSize} שחקנים`,
    },
    {
      id: 'squadTotal',
      label: 'סך הכל סגל',
      value: toPlayersValue(squadSize),
      helper: 'חיבור כל שכבות הדקות',
    },
  ]

  if (options.presentation === 'pdf') {
    return rows.filter(
      row =>
        row.id !== 'playersUnder500Minutes' &&
        row.id !== 'squadTotal'
    )
  }

  if (isCompactPrintView(options)) {
    return rows.filter(row => row.id !== 'playersUnder500Minutes')
  }

  return rows
}

const buildPrintSections = (groups = {}, options = {}) => {
  const squadUsageOptions = {
    squadSize: 24,
    includeRiskChips: false,
    targetPositionMode: options.targetPositionMode,
  }
  const targetRowsOptions = { targetPositionMode: options.targetPositionMode }

  const homeAwayRows = buildHomeAwayRows(groups.homeAway)
  const difficultyRows = buildDifficultyRows(groups.difficulty)
  const scorersRowsBase = buildScorersRows(groups.scorers, targetRowsOptions)
  const scorersRows = isCompactPrintView(options) ? compactScorersPrintRows(scorersRowsBase) : scorersRowsBase

  return [
    {
      id: 'homeAway',
      title: 'בית / חוץ',
      subtitle: '',
      rows: mapHomeAwayRowsForPrint(homeAwayRows),
    },
    {
      id: 'difficulty',
      title: 'רמת יריבה',
      subtitle: '',
      rows: mapDifficultyRowsForPrint(difficultyRows),
    },
    {
      id: 'scorers',
      title: 'פיזור כובשים',
      subtitle: 'גיוון התקפי ותלות מופחתת בשחקן אחד',
      rows: mapGenericRowsForPrint(scorersRows).filter(row => row.id !== 'occasionalScorer'),
    },
    {
      id: 'squadUsage',
      title: 'שימוש בסגל',
      subtitle: 'מדדי ריכוזיות ויציבות לצד חלוקה נפרדת מתוך סגל 24',
      rows: buildSquadUsageLayerRowsForPrint(groups.squadUsage, squadUsageOptions),
    },
  ]
}

export function buildManagementTargetsPrintModel({
  team,
  draft,
  isMobile = false,
  presentation = 'pdf',
}) {
  const model = buildManagementTargetsState({ team, draft })
  const targets = model.targets || {}
  const values = targets.values || {}
  const groups = targets.groups || {}
  const coachName = resolveCoachName(model.team)

  return {
    ...model,
    title: 'יעדי קבוצה',
    teamName: safeText(model.team.teamName, 'קבוצה'),
    teamDisplayName: resolveTeamDisplayName(model.team),
    clubName: resolveClubName(model.team),
    league: safeText(model.team.league, ''),
    teamYear: safeText(model.teamYear, ''),
    season: '26/27',
    coachName: 'שם מאמן',
    coachNameResolved: coachName,
    hasTargets: targets.hasTargets === true,
    targetPositionBox: {
      label: 'יעד המיקום שנקבע לקבוצה',
      value: buildTargetPositionText({ team: model.team, values, }),
    },
    metrics: buildMetrics(values, model.team),
    printSections: buildPrintSections(groups, {
      targetPositionMode: targets.targetPositionMode,
      isMobile,
      presentation,
    }),
    isMobile,
    presentation,
  }
}
