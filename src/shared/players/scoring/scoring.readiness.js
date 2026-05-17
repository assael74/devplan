// src/shared/players/scoring/scoring.readiness.js

/*
|--------------------------------------------------------------------------
| Player Scoring Engine / 3. Readiness Gate
|--------------------------------------------------------------------------
|
| אחריות:
| בדיקת מוכנות להפעלת מודל הציון לפני חישוב.
|
| סדר במנוע:
| 3 מתוך 5.
|
| תפקיד:
| זהו שער הבקרה של המנוע.
| אם חסר יעד קבוצה, מעמד שחקן, עמדה ראשית, נתוני משחק או דקות —
| המנוע לא ממשיך לחישוב ציון.
|
| משמש את:
| - scoring.match.js
|
| תלוי ב:
| - players/targets
| - scoring.config.js
| - scoring.status.js
|
| מחזיר:
| - ready
| - blocked
| - notRated
*/

import {
  buildPlayerDerivedTargets,
} from '../targets/index.js'

import {
  PLAYER_SCORING_CONFIG,
} from './scoring.config.js'

import {
  PLAYER_SCORING_STATUS,
  PLAYER_SCORING_BLOCK_REASON,
  PLAYER_SCORING_REASON_LABELS,
} from './scoring.status.js'

import {
  toNumber,
} from './scoring.utils.js'

const block = ({
  reason,
  targets = null,
  extra = {},
}) => {
  return {
    status: PLAYER_SCORING_STATUS.BLOCKED,
    isReady: false,
    reason,
    reasonLabel: PLAYER_SCORING_REASON_LABELS[reason] || '',
    targets,
    ...extra,
  }
}

const notRated = ({
  reason,
  targets = null,
  extra = {},
}) => {
  return {
    status: PLAYER_SCORING_STATUS.NOT_RATED,
    isReady: false,
    reason,
    reasonLabel: PLAYER_SCORING_REASON_LABELS[reason] || '',
    targets,
    ...extra,
  }
}

const ready = ({
  targets,
  timePlayed,
  hasLowMinutesSample,
}) => {
  return {
    status: PLAYER_SCORING_STATUS.READY,
    isReady: true,
    reason: '',
    reasonLabel: '',
    targets,
    timePlayed,
    hasLowMinutesSample,
  }
}

const hasSignificantAction = (playerGame = {}) => {
  return (
    toNumber(playerGame?.goals, 0) > 0 ||
    toNumber(playerGame?.assists, 0) > 0 ||
    playerGame?.redCard === true ||
    playerGame?.causedPenalty === true ||
    playerGame?.wonPenalty === true
  )
}

const hasRealTeamTarget = (targets = {}) => {
  return Boolean(
    targets?.teamTargets?.targetPosition ||
      targets?.teamTargets?.targetProfileId ||
      targets?.teamTargets?.resolvedProfileId
  )
}

export const resolveScoringReadiness = ({
  player,
  team,
  playerGame,
  calculationMode,
} = {}) => {
  if (!team) {
    return block({
      reason: PLAYER_SCORING_BLOCK_REASON.MISSING_TEAM,
    })
  }

  if (!calculationMode) {
    return block({
      reason: PLAYER_SCORING_BLOCK_REASON.MISSING_MODE,
    })
  }

  if (!player) {
    return block({
      reason: PLAYER_SCORING_BLOCK_REASON.MISSING_PLAYER,
    })
  }

  if (!playerGame) {
    return block({
      reason: PLAYER_SCORING_BLOCK_REASON.MISSING_PLAYER_GAME,
    })
  }

  const targets = buildPlayerDerivedTargets({
    player,
    team,
  })

  if (!hasRealTeamTarget(targets)) {
    return block({
      reason: PLAYER_SCORING_BLOCK_REASON.MISSING_TEAM_TARGET,
      targets,
    })
  }

  if (!targets?.role?.id) {
    return block({
      reason: PLAYER_SCORING_BLOCK_REASON.MISSING_ROLE,
      targets,
    })
  }

  if (!targets?.position?.layerKey) {
    return block({
      reason: PLAYER_SCORING_BLOCK_REASON.MISSING_POSITION,
      targets,
    })
  }

  const timePlayed = toNumber(playerGame?.timePlayed, 0)

  if (timePlayed <= 0) {
    return block({
      reason: PLAYER_SCORING_BLOCK_REASON.MISSING_TIME_PLAYED,
      targets,
    })
  }

  const hasLowMinutesSample =
    timePlayed < PLAYER_SCORING_CONFIG.minRatedMinutes

  if (hasLowMinutesSample && !hasSignificantAction(playerGame)) {
    return notRated({
      reason: PLAYER_SCORING_BLOCK_REASON.BELOW_MIN_MINUTES,
      targets,
      extra: {
        timePlayed,
        hasLowMinutesSample: true,
      },
    })
  }

  return ready({
    targets,
    timePlayed,
    hasLowMinutesSample,
  })
}
