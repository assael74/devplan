// src/shared/players/scoring/adapters/gameScores.js

/*
|--------------------------------------------------------------------------
| Player Scoring Engine / Adapter. Game Scores
|--------------------------------------------------------------------------
|
| אחריות:
| בניית ציוני משחק לכל שחקני המשחק מתוך game row ו־team.
|
| סדר במנוע:
| Adapter לפני שימוש במסכי teamGames / playerGames.
|
| תפקיד:
| לעבור על gamePlayers ששיחקו בפועל,
| לבנות input לכל שחקן,
| להריץ buildPlayerMatchScore,
| ולהחזיר מערך ציונים מוכן לשימוש.
*/

import {
  buildPlayerMatchScore,
} from '../scoring.match.js'

import {
  buildMatchScoreInput,
} from './matchInput.js'

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const getGameObject = (row = {}) => {
  return row?.game || row
}

const getGamePlayers = (row = {}) => {
  const game = getGameObject(row)

  if (Array.isArray(game?.gamePlayers)) return game.gamePlayers
  if (Array.isArray(row?.gamePlayers)) return row.gamePlayers

  return []
}

const hasPlayed = (playerGame = {}) => {
  return toNumber(playerGame?.timePlayed, 0) > 0
}

export const buildGamePlayerScores = ({
  row,
  game,
  team,
  calculationMode,
  coachAssessments = {},
  includeBench = false,
} = {}) => {
  const activeRow = row || game || {}
  const gamePlayers = getGamePlayers(activeRow)

  const scopedPlayers = includeBench
    ? gamePlayers
    : gamePlayers.filter(hasPlayed)

  return scopedPlayers.map((playerGame) => {
    const playerId = playerGame?.playerId || ''

    const scoreInput = buildMatchScoreInput({
      row: activeRow,
      team,
      playerId,
      calculationMode,
      coachAssessment: coachAssessments?.[playerId],
    })

    const score = buildPlayerMatchScore(scoreInput)

    return {
      playerId,
      player: scoreInput.player,
      playerGame,
      score,
    }
  })
}
