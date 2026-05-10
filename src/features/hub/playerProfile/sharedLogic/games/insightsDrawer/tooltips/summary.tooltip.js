// playerProfile/sharedLogic/games/insightsDrawer/tooltip/summary.tooltip.js

import {
  formatNumber,
  formatPercent,
  toNum,
} from '../common/index.js'

import {
  buildFormulaText,
  gapRow,
  numRow,
  pctRow,
  row,
  tooltip,
} from './tooltip.shared.js'

const getUsage = (games = {}) => {
  return games?.usage || {}
}

const getScoring = (games = {}) => {
  return games?.scoring || {}
}

const getDefense = (games = {}) => {
  return games?.defense || {}
}

const getGameTime = (games = {}) => {
  return toNum(games?.leagueGameTime, 90)
}

const buildMinutesTooltip = ({ games }) => {
  const usage = getUsage(games)

  return tooltip({
    title: 'פירוט אחוז דקות',
    rows: [
      pctRow({
        id: 'actual',
        label: 'בפועל',
        value: usage.minutesPct,
      }),
      numRow({
        id: 'minutesPlayed',
        label: 'דקות משחק',
        value: usage.minutesPlayed,
        suffix: 'דקות',
      }),
      numRow({
        id: 'minutesPossible',
        label: 'מכנה',
        value: usage.minutesPossible,
        suffix: 'דקות אפשריות',
      }),
      numRow({
        id: 'games',
        label: 'משחקי קבוצה',
        value: usage.teamGamesTotal,
        suffix: 'משחקים',
      }),
      numRow({
        id: 'gameTime',
        label: 'זמן משחק',
        value: usage.leagueGameTime || getGameTime(games),
        suffix: 'דקות',
      }),
      row({
        id: 'basis',
        label: 'בסיס חישוב',
        value: 'דקות משחק / דקות אפשריות',
      }),
    ],
  })
}

const buildStartsTooltip = ({ games }) => {
  const usage = getUsage(games)

  return tooltip({
    title: 'פירוט פתיחות בהרכב',
    rows: [
      pctRow({
        id: 'actual',
        label: 'בפועל',
        value: usage.startsPctFromTeamGames,
      }),
      numRow({
        id: 'starts',
        label: 'פתיחות',
        value: usage.starts,
        suffix: 'משחקים',
      }),
      numRow({
        id: 'teamGames',
        label: 'מכנה',
        value: usage.teamGamesTotal,
        suffix: 'משחקי קבוצה',
      }),
      pctRow({
        id: 'fromPlayed',
        label: 'מתוך משחקיו',
        value: usage.startsPctFromPlayed,
      }),
      row({
        id: 'basis',
        label: 'בסיס חישוב',
        value: 'פתיחות / משחקי ליגה של הקבוצה',
      }),
    ],
  })
}

const buildGoalContributionsTooltip = ({ games }) => {
  const scoring = getScoring(games)

  return tooltip({
    title: 'פירוט מעורבות שערים',
    rows: [
      numRow({
        id: 'actual',
        label: 'בפועל',
        value: scoring.goalContributions,
      }),
      numRow({
        id: 'goals',
        label: 'שערים',
        value: scoring.goals,
      }),
      numRow({
        id: 'assists',
        label: 'בישולים',
        value: scoring.assists,
      }),
      row({
        id: 'basis',
        label: 'בסיס חישוב',
        value: 'שערים + בישולים',
      }),
      pctRow({
        id: 'teamShare',
        label: 'חלק משערי הקבוצה',
        value: scoring.teamGoalsSharePct,
      }),
      numRow({
        id: 'teamGoals',
        label: 'שערי קבוצה',
        value: scoring.teamGoalsFor,
      }),
    ],
  })
}

const buildContributionsRateTooltip = ({ games }) => {
  const usage = getUsage(games)
  const scoring = getScoring(games)
  const gameTime = getGameTime(games)

  return tooltip({
    title: 'פירוט מעורבות למשחק',
    rows: [
      numRow({
        id: 'actual',
        label: 'בפועל',
        value: scoring.contributionsPerGame,
        digits: 2,
      }),
      numRow({
        id: 'goalContributions',
        label: 'מעורבויות',
        value: scoring.goalContributions,
      }),
      numRow({
        id: 'minutes',
        label: 'דקות משחק',
        value: usage.minutesPlayed,
        suffix: 'דקות',
      }),
      numRow({
        id: 'gameTime',
        label: 'זמן משחק',
        value: gameTime,
        suffix: 'דקות',
      }),
      row({
        id: 'basis',
        label: 'בסיס חישוב',
        value: 'מעורבויות / דקות משחק × זמן משחק',
      }),
      row({
        id: 'formula',
        label: 'חישוב',
        value: buildFormulaText({
          value: scoring.goalContributions,
          minutes: usage.minutesPlayed,
          gameTime,
          result: scoring.contributionsPerGame,
        }),
      }),
    ],
  })
}

const buildRoleTooltip = ({ targets = {} }) => {
  const role = targets?.role || {}
  const position = targets?.position || {}

  return tooltip({
    title: 'פירוט מעמד ועמדה',
    rows: [
      row({
        id: 'role',
        label: 'מעמד בסגל',
        value: role.label || 'לא הוגדר',
      }),
      row({
        id: 'position',
        label: 'עמדה',
        value: position.layerLabel || 'לא הוגדרה',
      }),
      row({
        id: 'basis',
        label: 'בסיס שימוש',
        value: 'המעמד והעמדה משמשים להשוואה מול הציפייה מהשחקן',
      }),
    ],
  })
}

const buildReliabilityTooltip = ({ games }) => {
  const usage = getUsage(games)
  const reliability = games?.reliability || {}

  return tooltip({
    title: 'פירוט אמינות מדגם',
    rows: [
      row({
        id: 'status',
        label: 'סטטוס',
        value: reliability.label || 'לא ידוע',
      }),
      numRow({
        id: 'minutes',
        label: 'דקות משחק',
        value: usage.minutesPlayed,
        suffix: 'דקות',
      }),
      row({
        id: 'caution',
        label: 'פרשנות',
        value: reliability.caution
          ? 'יש לפרש בזהירות בגלל מדגם נמוך'
          : 'מדגם מספיק לקריאת מגמה',
      }),
    ],
  })
}

const buildGoalsAgainstTooltip = ({ games }) => {
  const usage = getUsage(games)
  const defense = getDefense(games)
  const gameTime = getGameTime(games)

  return tooltip({
    title: 'פירוט ספיגה איתו',
    rows: [
      numRow({
        id: 'actual',
        label: 'ספיגה למשחק',
        value: defense.goalsAgainstPerGame,
        digits: 2,
      }),
      numRow({
        id: 'goalsAgainst',
        label: 'שערי חובה',
        value: defense.goalsAgainst,
      }),
      numRow({
        id: 'minutes',
        label: 'דקות משחק',
        value: usage.minutesPlayed,
        suffix: 'דקות',
      }),
      numRow({
        id: 'gameTime',
        label: 'זמן משחק',
        value: gameTime,
        suffix: 'דקות',
      }),
      row({
        id: 'basis',
        label: 'בסיס חישוב',
        value: 'שערי חובה / דקות משחק × זמן משחק',
      }),
      row({
        id: 'formula',
        label: 'חישוב',
        value: buildFormulaText({
          value: defense.goalsAgainst,
          minutes: usage.minutesPlayed,
          gameTime,
          result: defense.goalsAgainstPerGame,
        }),
      }),
    ],
  })
}

export const buildSummaryTooltip = ({ id, games = {}, targets = {} }) => {
  if (id === 'minutesPct') {
    return buildMinutesTooltip({ games, targets })
  }

  if (id === 'starts') {
    return buildStartsTooltip({ games, targets })
  }

  if (id === 'goalContributions') {
    return buildGoalContributionsTooltip({ games, targets })
  }

  if (id === 'contributionsPerGame') {
    return buildContributionsRateTooltip({ games, targets })
  }

  if (id === 'role') {
    return buildRoleTooltip({ games, targets })
  }

  if (id === 'reliability') {
    return buildReliabilityTooltip({ games, targets })
  }

  if (id === 'goalsAgainst') {
    return buildGoalsAgainstTooltip({ games, targets })
  }

  return null
}
