// src/shared/teams/scoring/scoring.debug.js

/*
|--------------------------------------------------------------------------
| Team Scoring Engine / Debug
|--------------------------------------------------------------------------
|
| אחריות:
| כלי debug לכיול ובדיקת מנוע ציון קבוצה.
|
| שימוש:
| להריץ על קבוצת משחקים ולראות:
| - ציון משחק
| - דלתאות
| - נקודות בפועל
| - נקודות צפויות
| - פער נקודות
| - difficulty
| - בית / חוץ
| - סטטוס readiness
|
| חשוב:
| הקובץ מיועד לפיתוח וכיול בלבד.
*/

import {
  buildScopedTeamScores,
} from './adapters/index.js'

import {
  buildTeamSeasonScore,
} from './scoring.season.js'

import {
  TEAM_SCORING_STATUS,
} from './scoring.status.js'

import {
  roundNumber,
  toNumber,
} from './scoring.utils.js'

const getScore = (item = {}) => {
  return item?.score || {}
}

const getContext = (item = {}) => {
  return getScore(item)?.context || {}
}

const getResultText = (context = {}) => {
  const goalsFor = toNumber(context?.goalsFor, 0)
  const goalsAgainst = toNumber(context?.goalsAgainst, 0)

  return `${goalsFor}:${goalsAgainst}`
}

const getPaceDelta = (context = {}) => {
  const actual = toNumber(context?.actualPoints, 0)
  const expected = toNumber(context?.expectedPointsForGame, 0)

  return roundNumber(actual - expected, 2)
}

const getDelta = ({
  item,
  key,
}) => {
  return roundNumber(getScore(item)?.deltas?.[key] || 0, 2)
}

const buildDebugRow = (item = {}, index = 0) => {
  const score = getScore(item)
  const context = getContext(item)

  return {
    '#': index + 1,

    gameId: item?.gameId || context?.gameId || '',
    date: item?.gameDate || '',

    status: score?.status || '',
    reason: score?.reason || '',

    rating:
      score?.status === TEAM_SCORING_STATUS.READY
        ? score?.rating
        : null,

    tva:
      score?.status === TEAM_SCORING_STATUS.READY
        ? roundNumber(toNumber(score?.rating, 0) - toNumber(score?.baseRating, 6), 2)
        : 0,

    result: getResultText(context),

    actualPoints: roundNumber(context?.actualPoints || 0, 2),
    expectedPoints: roundNumber(context?.expectedPointsForGame || 0, 2),
    pointsDelta: getPaceDelta(context),

    homeAway: context?.homeAway || '',
    difficulty: context?.difficulty || '',

    resultDelta: getDelta({ item, key: 'result' }),
    attackDelta: getDelta({ item, key: 'attack' }),
    defenseDelta: getDelta({ item, key: 'defense' }),
    contextDelta: getDelta({ item, key: 'context' }),
    sportingDirectorDelta: getDelta({ item, key: 'sportingDirector' }),

    targetProfileId: context?.targetProfileId || '',
    targetLabel: context?.targetLabel || '',
  }
}

const buildSummaryRow = (seasonScore = {}) => {
  return {
    status: seasonScore?.status || '',
    teamRating: seasonScore?.teamRating,
    tva: seasonScore?.tva,
    pointsPaceDelta: seasonScore?.pointsPaceDelta,
    ratedGames: seasonScore?.ratedGames,
    actualPoints: seasonScore?.actualPoints,
    expectedPoints: seasonScore?.expectedPoints,
    reliability: seasonScore?.reliability?.label || '',
  }
}

export const buildTeamScoringDebugModel = ({
  team,
  games,
  scope,
  sportingDirectorAssessments = {},
} = {}) => {
  const scopedScores = buildScopedTeamScores({
    team,
    games,
    scope,
    sportingDirectorAssessments,
  })

  const seasonScore = buildTeamSeasonScore({
    scores: scopedScores.flatScores,
  })

  const rows = scopedScores.flatScores.map(buildDebugRow)

  return {
    rows,
    seasonScore,
    summary: buildSummaryRow(seasonScore),
    scopedScores,
  }
}

export const printTeamScoringDebug = ({
  team,
  games,
  scope,
  sportingDirectorAssessments = {},
  title = 'Team Scoring Debug',
} = {}) => {
  const model = buildTeamScoringDebugModel({
    team,
    games,
    scope,
    sportingDirectorAssessments,
  })

  console.group(title)

  console.log('Summary')
  console.table([model.summary])

  console.log('Games')
  console.table(model.rows)

  console.groupEnd()

  return model
}
