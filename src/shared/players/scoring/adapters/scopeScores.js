// src/shared/players/scoring/adapters/scopeScores.js

/*
|--------------------------------------------------------------------------
| Player Scoring Engine / Adapter. Scope Scores
|--------------------------------------------------------------------------
|
| אחריות:
| בניית ציוני שחקנים לכל משחקי ה־scope.
|
| סדר במנוע:
| Scope Adapter אחרי scoring.scope.js ולפני season scoring / UI.
|
| תפקיד:
| לסנן משחקים לפי scope,
| לעבור על כל משחק חוקי,
| להריץ buildGamePlayerScores,
| ולהחזיר מבנה ציונים מרוכז לפי משחק.
*/

import {
  buildScoringScope,
} from '../scoring.scope.js'

import {
  buildGamePlayerScores,
} from './gameScores.js'

const getGameObject = (row = {}) => {
  return row?.game || row
}

const getGameId = (row = {}) => {
  const game = getGameObject(row)

  return (
    row?.gameId ||
    game?.id ||
    game?.gameId ||
    ''
  )
}

const getGameDate = (row = {}) => {
  const game = getGameObject(row)

  return (
    game?.gameDate ||
    game?.date ||
    row?.gameDate ||
    row?.date ||
    ''
  )
}

const getGameResult = (row = {}) => {
  const game = getGameObject(row)

  return {
    goalsFor: game?.goalsFor ?? row?.goalsFor ?? null,
    goalsAgainst: game?.goalsAgainst ?? row?.goalsAgainst ?? null,
    result: game?.result || row?.result || '',
  }
}

const asText = (value) => {
  return value == null ? '' : String(value).trim()
}

const filterByPlayerId = ({
  scores,
  playerId,
}) => {
  const id = asText(playerId)

  if (!id) return scores

  return scores.filter((item) => {
    return asText(item?.playerId) === id
  })
}

export const buildScopedGameScores = ({
  games,
  team,
  calculationMode,
  scope,
  playerId,
  coachAssessments = {},
} = {}) => {
  const scoped = buildScoringScope({
    games,
    scope,
  })

  const gameScores = scoped.games.map((row) => {
    const scores = buildGamePlayerScores({
      row,
      team,
      calculationMode,
      coachAssessments,
    })

    const scopedScores = filterByPlayerId({
      scores,
      playerId,
    })

    return {
      gameId: getGameId(row),
      gameDate: getGameDate(row),
      game: row,
      result: getGameResult(row),
      scoresCount: scopedScores.length,
      scores: scopedScores,
    }
  })

  const flatScores = gameScores.flatMap((item) => {
    return item.scores.map((scoreItem) => ({
      gameId: item.gameId,
      gameDate: item.gameDate,
      result: item.result,
      ...scoreItem,
    }))
  })

  return {
    scope: scoped.scope,

    allGamesCount: scoped.allGamesCount,
    filteredGamesCount: scoped.filteredGamesCount,
    scopedGamesCount: scoped.scopedGamesCount,

    gamesCount: gameScores.length,
    scoresCount: flatScores.length,

    games: gameScores,
    flatScores,
  }
}
