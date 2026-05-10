// playerProfile/sharedLogic/games/insightsDrawer/tooltip/score.tooltip.js

import {
  getFullDateIl,
} from '../../../../../../../shared/format/dateUtiles.js'

import {
  numRow,
  row,
  tooltip,
} from './tooltip.shared.js'

const safeArray = (value) => {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

const toNum = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const getMetrics = (brief = {}) => {
  return brief?.metrics || {}
}

const getTargets = (targets = {}) => {
  return targets?.explicitTargets?.attack || {}
}

const getGameTime = (brief = {}) => {
  return (
    brief?.metrics?.leagueGameTime ||
    brief?.raw?.leagueGameTime ||
    90
  )
}

const getMinutes = (brief = {}) => {
  return getMetrics(brief).minutesPlayed || 0
}

const getGameObject = (row = {}) => {
  return row?.game || row
}

const getGameRows = (gamesData) => {
  if (Array.isArray(gamesData)) {
    return safeArray(gamesData)
  }

  if (Array.isArray(gamesData?.leaguePlayedGames)) {
    return safeArray(gamesData.leaguePlayedGames)
  }

  if (Array.isArray(gamesData?.playedGames)) {
    return safeArray(gamesData.playedGames)
  }

  if (Array.isArray(gamesData?.rows)) {
    return safeArray(gamesData.rows)
  }

  return []
}

const getGameName = (row = {}) => {
  const game = getGameObject(row)
  return (
    row.rival ||
    'יריבה'
  )
}

const getGameDateValue = (row = {}) => {
  const game = getGameObject(row)

  return row?.game?.gameDate || row?.gameDate || ''
}

const getGameDate = (row = {}) => {
  return getFullDateIl(getGameDateValue(row))
}

const getGoalValue = (row = {}) => {
  return toNum(row?.goals)
}

const getAssistValue = (row = {}) => {
  return toNum(row?.assists)
}

const buildGameText = ({ row, value, suffix }) => {
  const opponent = getGameName(row)
  const date = getGameDate(row)
  const dateText = date && date !== '—' ? ` · ${date}` : ''
  const suffixText = suffix ? ` ${suffix}` : ''

  return `${opponent}${dateText} · ${value}${suffixText}`.trim()
}

const buildGameItems = ({ rows = [], type, suffix }) => {
  return safeArray(rows)
    .filter((row) => {
      const value = type === 'goals'
        ? getGoalValue(row)
        : getAssistValue(row)

      return value > 0
    })
    .map((row) => {
      const value = type === 'goals'
        ? getGoalValue(row)
        : getAssistValue(row)

      return {
        id: row.id || row.gameId || `${getGameName(row)}_${type}`,
        text: buildGameText({
          row,
          value,
          suffix,
        }),
      }
    })
}

const buildContributionItems = (rows = []) => {
  return safeArray(rows)
    .filter((row) => {
      return getGoalValue(row) > 0 || getAssistValue(row) > 0
    })
    .map((row) => {
      const goals = getGoalValue(row)
      const assists = getAssistValue(row)
      const total = goals + assists

      return {
        id: row.id || row.gameId || `${getGameName(row)}_contribution`,
        text: buildGameText({
          row,
          value: `${total} מעורבויות (${goals} שערים, ${assists} בישולים)`,
          suffix: '',
        }),
      }
    })
}

const addItemsRow = ({ rows, id, label, items }) => {
  if (!Array.isArray(items) || !items.length) return

  rows.push({
    id,
    label,
    items,
  })
}

const buildSeasonTargetRow = (value) => {
  const target = Number(value)

  if (!Number.isFinite(target) || target <= 0) {
    return row({
      id: 'target',
      label: 'יעד',
      value: 'לא הוגדר יעד עונתי',
    })
  }

  return numRow({
    id: 'target',
    label: 'יעד עונתי',
    value: target,
  })
}

const buildGoalsTooltip = ({ brief, targets, gamesData }) => {
  const metrics = getMetrics(brief)
  const attack = getTargets(targets)
  const gameRows = getGameRows(gamesData)

  const rows = [
    numRow({
      id: 'actual',
      label: 'בפועל',
      value: metrics.goals,
    }),
    buildSeasonTargetRow(attack.goalsTarget),
    numRow({
      id: 'minutes',
      label: 'דקות משחק',
      value: getMinutes(brief),
      suffix: 'דקות',
    }),
    numRow({
      id: 'rate',
      label: 'שערים למשחק',
      value: metrics.goalsPerGame,
      digits: 2,
    }),
    row({
      id: 'basis',
      label: 'בסיס חישוב',
      value: 'שערים שנספרו במשחקי ליגה שבהם השחקן שותף',
    }),
  ]

  addItemsRow({
    rows,
    id: 'goalGames',
    label: 'משחקים בהם כבש',
    items: buildGameItems({
      rows: gameRows,
      type: 'goals',
      suffix: 'שערים',
    }),
  })

  return tooltip({
    title: 'פירוט שערים',
    rows,
  })
}

const buildAssistsTooltip = ({ brief, targets, gamesData }) => {
  const metrics = getMetrics(brief)
  const attack = getTargets(targets)
  const gameRows = getGameRows(gamesData)

  const rows = [
    numRow({
      id: 'actual',
      label: 'בפועל',
      value: metrics.assists,
    }),
    buildSeasonTargetRow(attack.assistsTarget),
    numRow({
      id: 'minutes',
      label: 'דקות משחק',
      value: getMinutes(brief),
      suffix: 'דקות',
    }),
    numRow({
      id: 'rate',
      label: 'בישולים למשחק',
      value: metrics.assistsPerGame,
      digits: 2,
    }),
    row({
      id: 'basis',
      label: 'בסיס חישוב',
      value: 'בישולים שנספרו במשחקי ליגה שבהם השחקן שותף',
    }),
  ]

  addItemsRow({
    rows,
    id: 'assistGames',
    label: 'משחקים בהם בישל',
    items: buildGameItems({
      rows: gameRows,
      type: 'assists',
      suffix: 'בישולים',
    }),
  })

  return tooltip({
    title: 'פירוט בישולים',
    rows,
  })
}

const buildContributionTooltip = ({ brief, targets, gamesData }) => {
  const metrics = getMetrics(brief)
  const attack = getTargets(targets)
  const gameTime = getGameTime(brief)
  const gameRows = getGameRows(gamesData)

  const rows = [
    numRow({
      id: 'actual',
      label: 'בפועל',
      value: metrics.goalContributions,
    }),
    buildSeasonTargetRow(attack.goalContributionsTarget),
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
    numRow({
      id: 'rate',
      label: 'מעורבות למשחק',
      value: metrics.contributionsPerGame,
      digits: 2,
    }),
    numRow({
      id: 'minutes',
      label: 'דקות משחק',
      value: getMinutes(brief),
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
      value: 'שערים + בישולים',
    }),
  ]

  addItemsRow({
    rows,
    id: 'contributionGames',
    label: 'משחקים עם מעורבות',
    items: buildContributionItems(gameRows),
  })

  return tooltip({
    title: 'פירוט מעורבות שערים',
    rows,
  })
}

export const buildScoreTooltip = ({ id, brief, targets, gamesData }) => {
  if (id === 'goals') {
    return buildGoalsTooltip({
      brief,
      targets,
      gamesData,
    })
  }

  if (id === 'assists') {
    return buildAssistsTooltip({
      brief,
      targets,
      gamesData,
    })
  }

  if (id === 'goalContributions') {
    return buildContributionTooltip({
      brief,
      targets,
      gamesData,
    })
  }

  return null
}
