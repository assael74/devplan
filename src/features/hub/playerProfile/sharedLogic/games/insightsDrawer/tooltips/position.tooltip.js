// playerProfile/sharedLogic/games/insightsDrawer/tooltip/position.tooltip.js

import {
  numRow,
  pctRow,
  row,
  tooltip,
} from './tooltip.shared.js'

const getMetrics = (brief = {}) => {
  return brief?.metrics || {}
}

const getDefenseTargets = (targets = {}) => {
  return targets?.explicitTargets?.defense || {}
}

const getAttackTargets = (targets = {}) => {
  return targets?.explicitTargets?.attack || {}
}

const getGoalsAgainstTarget = ({ brief, targets, }) => {
  const metrics = getMetrics(brief)
  const defenseTargets = getDefenseTargets(targets)

  return (
    metrics.goalsAgainstPerGameTarget ||
    defenseTargets.goalsAgainstPerGameTarget ||
    0
  )
}

const buildGoalsAgainstTooltip = ({ brief, targets, }) => {
  const metrics = getMetrics(brief)
  const target = getGoalsAgainstTarget({
    brief,
    targets,
  })

  return tooltip({
    title: 'פירוט ספיגה למשחק',
    rows: [
      numRow({
        id: 'actual',
        label: 'בפועל',
        value: metrics.goalsAgainstPerGame,
        digits: 2,
      }),
      numRow({
        id: 'target',
        label: 'יעד',
        value: target,
        digits: 2,
      }),
      numRow({
        id: 'goalsAgainst',
        label: 'שערי חובה',
        value: metrics.goalsAgainst,
      }),
      numRow({
        id: 'minutes',
        label: 'דקות משחק',
        value: metrics.minutesPlayed,
        suffix: 'דקות',
      }),
      row({
        id: 'basis',
        label: 'בסיס חישוב',
        value: 'שערי חובה בזמן ששיחק / דקות משחק × זמן משחק',
      }),
    ],
  })
}

const buildCleanSheetTooltip = ({ brief }) => {
  const metrics = getMetrics(brief)

  return tooltip({
    title: 'פירוט רשת נקייה',
    rows: [
      pctRow({
        id: 'actual',
        label: 'בפועל',
        value: metrics.cleanSheetPct,
      }),
      numRow({
        id: 'cleanSheets',
        label: 'משחקים ללא ספיגה',
        value: metrics.cleanSheets,
      }),
      numRow({
        id: 'games',
        label: 'מכנה',
        value: metrics.gamesIncluded || metrics.sampleSize || 0,
        suffix: 'משחקים',
      }),
      row({
        id: 'basis',
        label: 'בסיס חישוב',
        value: 'משחקים ללא ספיגה מתוך משחקים שבהם השחקן שותף',
      }),
    ],
  })
}

const buildPositionContributionTooltip = ({ brief, targets, }) => {
  const metrics = getMetrics(brief)
  const attackTargets = getAttackTargets(targets)

  return tooltip({
    title: 'פירוט תרומה התקפית',
    rows: [
      numRow({
        id: 'actual',
        label: 'מעורבויות',
        value: metrics.goalContributions,
      }),
      numRow({
        id: 'target',
        label: 'יעד עונתי',
        value: attackTargets.goalContributionsTarget,
      }),
      numRow({
        id: 'goals',
        label: 'שערים',
        value: metrics.goals,
      }),
      numRow({
        id: 'assists',
        label: 'בישולים',
        value: metrics.assists,
      }),
      row({
        id: 'basis',
        label: 'בסיס חישוב',
        value: 'שערים + בישולים',
      }),
    ],
  })
}

const buildGenericPositionTooltip = ({ id, brief, targets, }) => {
  if (id === 'goalsAgainstPerGame') {
    return buildGoalsAgainstTooltip({
      brief,
      targets,
    })
  }

  if (id === 'cleanSheetPct') {
    return buildCleanSheetTooltip({
      brief,
      targets,
    })
  }

  if (id === 'goalContributions') {
    return buildPositionContributionTooltip({
      brief,
      targets,
    })
  }

  return null
}

export const buildPositionTooltip = ({ id, brief, targets, }) => {
  return buildGenericPositionTooltip({
    id,
    brief,
    targets,
  })
}
