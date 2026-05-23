// src/shared/teams/scoring/scoring.readiness.js

/*
|--------------------------------------------------------------------------
| Team Scoring Engine / Readiness Gate
|--------------------------------------------------------------------------
|
| אחריות:
| בדיקת מוכנות להפעלת מודל ציון קבוצה לפני חישוב.
|
| אם חסרה קבוצה, משחק, יעד קבוצה, תוצאה או שהמשחק לא שוחק —
| המנוע לא ממשיך לחישוב ציון.
*/

import {
  buildTeamTargetsState,
} from '../targets/index.js'

import {
  isGamePlayed,
} from '../../games/games.constants.js'

import {
  TEAM_SCORING_STATUS,
  TEAM_SCORING_BLOCK_REASON,
  TEAM_SCORING_REASON_LABELS,
} from './scoring.status.js'

import {
  getGameObject,
  toNumber,
} from './scoring.utils.js'

const block = ({
  reason,
  targets = null,
  extra = {},
}) => {
  return {
    status: TEAM_SCORING_STATUS.BLOCKED,
    isReady: false,
    reason,
    reasonLabel: TEAM_SCORING_REASON_LABELS[reason] || '',
    targets,
    ...extra,
  }
}

const ready = ({
  targets,
}) => {
  return {
    status: TEAM_SCORING_STATUS.READY,
    isReady: true,
    reason: '',
    reasonLabel: '',
    targets,
  }
}

const hasRealTeamTarget = (targets = {}) => {
  return Boolean(
    targets?.targetPosition ||
      targets?.targetProfileId ||
      targets?.resolvedProfileId ||
      targets?.targetProfile
  )
}

const isFilledScoreValue = value => {
  return value !== null && value !== undefined && value !== ''
}

const pickScoreValue = (...values) => {
  for (const value of values) {
    if (isFilledScoreValue(value)) {
      return value
    }
  }

  return null
}

const resolveGameResult = (game = {}) => {
  const source = getGameObject(game)
  const result = source?.result || {}

  const goalsFor = pickScoreValue(
    source?.goalsFor,
    source?.teamGoals,
    source?.goals,
    source?.scoreFor,
    source?.home === true ? source?.homeGoals : source?.awayGoals,
    result?.goalsFor,
    result?.teamGoals,
    result?.for
  )

  const goalsAgainst = pickScoreValue(
    source?.goalsAgainst,
    source?.rivalGoals,
    source?.opponentGoals,
    source?.against,
    source?.scoreAgainst,
    source?.home === true ? source?.awayGoals : source?.homeGoals,
    result?.goalsAgainst,
    result?.rivalGoals,
    result?.against
  )

  return {
    goalsFor: toNumber(goalsFor, null),
    goalsAgainst: toNumber(goalsAgainst, null),
  }
}

const hasGameResult = (game = {}) => {
  const result = resolveGameResult(game)

  return (
    Number.isFinite(result.goalsFor) &&
    Number.isFinite(result.goalsAgainst)
  )
}

export const resolveTeamScoringReadiness = ({
  team,
  game,
} = {}) => {
  if (!team) {
    return block({
      reason: TEAM_SCORING_BLOCK_REASON.MISSING_TEAM,
    })
  }

  if (!game) {
    return block({
      reason: TEAM_SCORING_BLOCK_REASON.MISSING_GAME,
    })
  }

  const source = getGameObject(game)

  if (!isGamePlayed(game) && !isGamePlayed(source)) {
    return block({
      reason: TEAM_SCORING_BLOCK_REASON.GAME_NOT_PLAYED,
    })
  }

  const targets = buildTeamTargetsState(team)

  if (!hasRealTeamTarget(targets)) {
    return block({
      reason: TEAM_SCORING_BLOCK_REASON.MISSING_TEAM_TARGET,
      targets,
    })
  }

  if (!hasGameResult(source)) {
    return block({
      reason: TEAM_SCORING_BLOCK_REASON.MISSING_RESULT,
      targets,
      extra: {
        result: resolveGameResult(source),
      },
    })
  }

  return ready({
    targets,
  })
}
