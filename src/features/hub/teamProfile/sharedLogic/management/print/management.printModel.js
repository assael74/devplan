// teamProfile/sharedLogic/management/management.printModel.js

import {
  buildDifficultyRows,
  buildHomeAwayRows,
  buildScorersRows,
  buildSquadUsageRows,
  formatTargetValue,
} from '../../../../../../shared/teams/targets/index.js'

import { safeText } from '../management.safe.js'

import {
  buildTargetPositionHelper,
  buildTargetPositionText,
} from '../targets/index.js'

import {
  mapDifficultyRowsForPrint,
  mapGenericRowsForPrint,
  mapHomeAwayRowsForPrint,
} from './management.printRows.js'

import {
  buildManagementTargetsState,
} from '../management.state.js'

const buildMetrics = (values = {}) => {
  return [
    {
      id: 'points',
      label: 'יעד נקודות',
      value: formatTargetValue(values.points),
      helper: values.rankRangeLabel,
    },
    {
      id: 'successRate',
      label: 'יעד אחוז הצלחה',
      value: formatTargetValue(values.successRate, '%'),
    },
    {
      id: 'goalsFor',
      label: 'שערי זכות',
      value: formatTargetValue(values.goalsFor),
    },
    {
      id: 'goalsAgainst',
      label: 'שערי חובה',
      value: formatTargetValue(values.goalsAgainst),
    },
    {
      id: 'goalDifference',
      label: 'הפרש שערים',
      value: formatTargetValue(values.goalDifference),
    },
  ]
}

const buildPrintSections = (groups = {}) => {
  const squadUsageOptions = {
    squadSize: 24,
    includeRiskChips: false,
  }

  const homeAwayRows = buildHomeAwayRows(groups.homeAway)
  const difficultyRows = buildDifficultyRows(groups.difficulty)
  const scorersRows = buildScorersRows(groups.scorers)
  const squadRows = buildSquadUsageRows(groups.squadUsage, squadUsageOptions)

  return [
    {
      id: 'homeAway',
      title: 'בית / חוץ',
      subtitle: 'הצלחה צפויה בצבירת נקודות לפי מיקום המשחק',
      rows: mapHomeAwayRowsForPrint(homeAwayRows),
    },
    {
      id: 'difficulty',
      title: 'רמת יריבה',
      subtitle: 'הצלחה צפויה בצבירת נקודות לפי חוזק היריבה',
      rows: mapDifficultyRowsForPrint(difficultyRows),
    },
    {
      id: 'scorers',
      title: 'פיזור כובשים',
      subtitle: 'גיוון התקפי ותלות מופחתת בשחקן אחד',
      rows: mapGenericRowsForPrint(scorersRows),
    },
    {
      id: 'squadUsage',
      title: 'שימוש בסגל',
      subtitle: 'כמות שחקנים רצויה מתוך סגל 24',
      rows: mapGenericRowsForPrint(squadRows),
    },
  ]
}

export function buildManagementTargetsPrintModel({
  team,
  draft,
}) {
  const model = buildManagementTargetsState({
    team,
    draft,
  })

  const targets = model.targets || {}
  const values = targets.values || {}
  const groups = targets.groups || {}

  return {
    ...model,
    title: 'יעדי קבוצה',
    teamName: safeText(model.team.teamName, 'קבוצה'),
    league: safeText(model.team.league, ''),
    season: safeText(model.team.teamYear, ''),
    coachName: 'שם מאמן',
    hasTargets: targets.hasTargets === true,

    targetPositionBox: {
      label: 'יעד המיקום שנקבע לקבוצה',
      value: buildTargetPositionText({
        team: model.team,
        values,
      }),
      helper: buildTargetPositionHelper({
        team: model.team,
        values,
      }),
    },

    metrics: buildMetrics(values),
    printSections: buildPrintSections(groups),
  }
}
