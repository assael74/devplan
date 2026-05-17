// teamProfile/sharedLogic/players/insightsLogic/production/production.model.js

import {
  clean,
  getInvolvement,
  getMinutesPct,
  buildPlayerRef,
  sortPlayersByInvolvement,
  toNum,
} from '../common/index.js'

import {
  getPlayerPositionTarget,
} from '../../../../../../../shared/players/targets/index.js'

const isAttackLayer = (layerKey) => {
  return ['attack', 'atMidfield'].includes(clean(layerKey))
}

const isDefenseLayer = (layerKey) => {
  return ['defense', 'goalkeeper', 'dmMid'].includes(clean(layerKey))
}

const getContributionPerGame = (row = {}) => {
  const stats = row?.playerGamesStats || {}
  const games = toNum(stats.playerPlayedGames)

  if (!games) return 0

  return Number((getInvolvement(row) / games).toFixed(2))
}

const getGoalsPerGame = (row = {}) => {
  const stats = row?.playerGamesStats || {}
  const games = toNum(stats.playerPlayedGames)

  if (!games) return 0

  return Number((toNum(stats.goals) / games).toFixed(2))
}

const getAssistsPerGame = (row = {}) => {
  const stats = row?.playerGamesStats || {}
  const games = toNum(stats.playerPlayedGames)

  if (!games) return 0

  return Number((toNum(stats.assists) / games).toFixed(2))
}

const evaluateAttackProduction = (row = {}) => {
  const layerKey = clean(row?.generalPositionKey)
  const target = getPlayerPositionTarget(layerKey)

  const contributionPerGame = getContributionPerGame(row)
  const goalsPerGame = getGoalsPerGame(row)
  const assistsPerGame = getAssistsPerGame(row)

  const contributionTarget = target?.contributionPerGame || null
  const goalsTarget = target?.goalsPerGame || null
  const assistsTarget = target?.assistsPerGame || null

  const redBelow = contributionTarget?.redBelow
  const greenMin = contributionTarget?.greenMin

  let tone = 'neutral'
  let status = 'missingTarget'

  if (greenMin !== null && greenMin !== undefined) {
    if (contributionPerGame >= greenMin) {
      tone = 'success'
      status = 'ok'
    } else if (
      redBelow !== null &&
      redBelow !== undefined &&
      contributionPerGame < redBelow
    ) {
      tone = 'warning'
      status = 'under'
    } else {
      tone = 'neutral'
      status = 'partial'
    }
  }

  return {
    layerKey,
    target,
    contributionPerGame,
    goalsPerGame,
    assistsPerGame,
    contributionTarget,
    goalsTarget,
    assistsTarget,
    tone,
    status,
  }
}

const buildProductionPlayer = (row = {}) => {
  const attackEvaluation = evaluateAttackProduction(row)
  const layerKey = clean(row?.generalPositionKey)

  return buildPlayerRef(row, {
    layerKey,
    mainProductionSide: isDefenseLayer(layerKey) ? 'defense' : 'attack',
    secondaryProductionSide: isDefenseLayer(layerKey) ? 'attack' : 'defense',
    attackEvaluation,
  })
}

const buildAttackProduction = ({
  players = [],
}) => {
  const contributors = players.filter((player) => {
    return player.involvement > 0
  })

  const highMinutesNoProduction = players.filter((player) => {
    return player.minutesPct >= 50 && player.involvement === 0
  })

  const lowMinutesHighProduction = players.filter((player) => {
    return player.minutesPct < 35 && player.involvement >= 2
  })

  return {
    contributors: sortPlayersByInvolvement(contributors),
    highMinutesNoProduction,
    lowMinutesHighProduction,

    goalsTotal: players.reduce((sum, player) => {
      return sum + toNum(player.goals)
    }, 0),

    assistsTotal: players.reduce((sum, player) => {
      return sum + toNum(player.assists)
    }, 0),

    involvementTotal: players.reduce((sum, player) => {
      return sum + toNum(player.involvement)
    }, 0),
  }
}

const buildDefenseProduction = ({
  rows = [],
}) => {
  const defensivePlayers = rows
    .filter((row) => isDefenseLayer(row?.generalPositionKey))
    .map((row) => buildPlayerRef(row))

  const attackPlayers = rows
    .filter((row) => isAttackLayer(row?.generalPositionKey))
    .map((row) => buildPlayerRef(row))

  return {
    ready: false,

    reason:
      'חסר פירוט משחקים פר־שחקן עם שערי חובה / תוצאה / דקות כדי לחשב ביצוע הגנתי אישי אמין.',

    requiredData: [
      'gamesBreakdown',
      'goalsAgainst with player',
      'goalsAgainst without player',
      'difficulty split',
      'minutes by game',
    ],

    defensivePlayers,
    attackPlayers,

    reference:
      'שחקני הגנה נמדדים בעיקר מול ביצוע הגנתי קבוצתי; שחקני התקפה מקבלים reference הגנתי משני.',
  }
}

export const buildProductionModel = ({
  rows = [],
} = {}) => {
  const players = rows.map((row) => buildProductionPlayer(row))

  return {
    players,

    attack: buildAttackProduction({
      players,
    }),

    defense: buildDefenseProduction({
      rows,
    }),
  }
}
