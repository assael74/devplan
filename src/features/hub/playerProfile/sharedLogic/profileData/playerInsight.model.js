// src/features/hub/playerProfile/sharedLogic/profileData/playerInsight.model.js

import {
  buildPlayerInsightProfile,
} from '../../../../../shared/players/insights/index.js'

const emptyArray = []

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const toNumber = (value, fallback = 0) => {
  const n = Number(value)

  return Number.isFinite(n) ? n : fallback
}

const getPlayerId = player => {
  return asText(player?.playerId || player?.id)
}

const getScoringRows = playerScoring => {
  return Array.isArray(playerScoring?.rows)
    ? playerScoring.rows
    : emptyArray
}

const getGameMinutes = row => {
  return toNumber(
    row?.context?.gameMinutes ||
      row?.score?.context?.gameMinutes ||
      row?.game?.gameDuration,
    90
  )
}

const buildClassificationMeta = ({ rows, mode = 'season' } = {}) => {
  const safeRows = Array.isArray(rows) ? rows : emptyArray

  return {
    mode,
    scopeGames: safeRows.length,
    scopeMaxMinutes: safeRows.reduce((sum, row) => {
      return sum + getGameMinutes(row)
    }, 0),
  }
}

export const buildPlayerProfileInsightModel = ({ player, playerScoring, classificationMode = 'season' } = {}) => {
  const playerId = getPlayerId(player)
  const rows = getScoringRows(playerScoring)

  if (!playerId || !rows.length) {
    return {
      profile: null,
      insight: null,
      insightId: '',
      insightLabel: '',
      meta: {
        ready: false,
        reason: !playerId ? 'missing_player' : 'missing_scores',
      },
    }
  }

  const classificationMeta = buildClassificationMeta({
    rows,
    mode: classificationMode,
  })

  const model = buildPlayerInsightProfile({
    playerId,
    scores: rows,
    classificationMeta,
  })

  return {
    ...model,

    meta: {
      ready: true,
      source: 'playerProfile.playerInsight',
      classificationMode,
      scoresCount: rows.length,
      profileId: model?.insightId || '',
    },
  }
}
