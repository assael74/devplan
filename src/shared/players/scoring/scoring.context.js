// src/shared/players/scoring/scoring.context.js

/*
|--------------------------------------------------------------------------
| Player Scoring Engine / 4. Context Builder
|--------------------------------------------------------------------------
|
| אחריות:
| בניית אובייקט context אחיד לחישוב ציון משחק.
|
| חשוב:
| ציפיות קבוצתיות למשחק לא מחושבות כאן.
| מקור האמת לציפיות משחק:
| src/shared/teams/expectations
*/

import {
  buildTeamGameExpectations,
} from '../../teams/expectations/index.js'

import {
  PLAYER_SCORING_CONFIG,
} from './scoring.config.js'

import {
  toNumber,
} from './scoring.utils.js'

const getGameObject = (game = {}) => {
  return game?.game || game
}

const getGameMinutes = ({
  game,
  team,
}) => {
  const source = getGameObject(game)

  return (
    toNumber(team?.leagueGameTime, 0) ||
    toNumber(source?.gameDuration, 0) ||
    90
  )
}

const getOpponentLevel = (game = {}) => {
  const source = getGameObject(game)

  return (
    source?.difficulty ||
    PLAYER_SCORING_CONFIG.defaultOpponentLevel
  )
}

const getTeamGoalsFor = (game = {}) => {
  const source = getGameObject(game)

  return toNumber(source?.goalsFor, 0)
}

const getTeamGoalsAgainst = (game = {}) => {
  const source = getGameObject(game)

  return toNumber(source?.goalsAgainst, 0)
}

const buildTeamExpectations = ({
  team,
  game,
  readiness,
}) => {
  return buildTeamGameExpectations({
    team,
    game,
    targets: readiness?.targets?.teamTargets,
  })
}

export const buildScoringContext = ({
  player,
  team,
  game,
  playerGame,
  calculationMode,
  readiness,
} = {}) => {
  const targets = readiness?.targets || {}
  const explicitTargets = targets?.explicitTargets || {}
  const gameMinutes = getGameMinutes({
    game,
    team,
  })

  const timePlayed = toNumber(playerGame?.timePlayed, 0)

  const teamGameExpectations = buildTeamExpectations({
    team,
    game,
    readiness,
  })

  return {
    calculationMode,

    playerId: player?.id || playerGame?.playerId || '',
    gameId: game?.id || game?.gameId || '',

    roleId: targets?.role?.id || '',
    roleLabel: targets?.role?.label || '',

    positionLayer: targets?.position?.layerKey || '',
    positionLabel:
      targets?.position?.layerLabel ||
      targets?.position?.label ||
      '',

    teamProfileId:
      targets?.teamTargets?.resolvedProfileId ||
      targets?.teamTargets?.targetProfileId ||
      '',

    opponentLevel: getOpponentLevel(game),

    gameMinutes,
    timePlayed,

    goals: toNumber(playerGame?.goals, 0),
    assists: toNumber(playerGame?.assists, 0),
    involvement:
      toNumber(playerGame?.goals, 0) +
      toNumber(playerGame?.assists, 0),

    teamGoalsFor: getTeamGoalsFor(game),
    teamGoalsAgainst: getTeamGoalsAgainst(game),

    seasonTargets: {
      ...(explicitTargets?.teamSeasonTargets || {}),
      leagueNumGames: explicitTargets?.leagueNumGames || 0,
    },

    teamGameExpectations,

    attackTargets: explicitTargets?.attack || {},
    defenseTargets: explicitTargets?.defense || {},

    hasLowMinutesSample: readiness?.hasLowMinutesSample === true,
  }
}
