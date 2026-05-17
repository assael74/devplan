// src/shared/teams/insights/insights.players.js

import {
  TEAM_INSIGHTS_THRESHOLDS,
} from './insights.config.js'

const emptyArray = []

const toNum = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const toNullableNum = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const getPid = player => {
  return asText(
    player?.playerId ||
    player?.id ||
    player?.player?.id ||
    player?.player?.playerId ||
    ''
  )
}

const getName = player => {
  return asText(
    player?.playerFullName ||
    player?.fullName ||
    player?.name ||
    player?.player?.playerFullName ||
    ''
  ) || 'שחקן'
}

const getPrimaryPosition = player => {
  return asText(
    player?.primaryPosition ||
    player?.positionId ||
    player?.positionLabel ||
    player?.generalPositionKey ||
    ''
  )
}

const getTvaTone = tva => {
  if (tva > 0) return 'success'
  if (tva < 0) return 'danger'

  return 'neutral'
}

const fmtRating = value => {
  return value === null ? '-' : value.toFixed(2)
}

const fmtTva = value => {
  if (!value) return '0'
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)
}

const isWeakPlayer = ({
  ratingRaw,
  tva,
}) => {
  if (ratingRaw !== null && ratingRaw < TEAM_INSIGHTS_THRESHOLDS.weakRatingBelow) {
    return true
  }

  return tva < TEAM_INSIGHTS_THRESHOLDS.weakTvaBelow
}

const isTopPlayer = ({
  ratingRaw,
  tva,
}) => {
  if (ratingRaw === null) return false

  return (
    ratingRaw >= TEAM_INSIGHTS_THRESHOLDS.topRatingFrom &&
    tva >= TEAM_INSIGHTS_THRESHOLDS.topTvaFrom
  )
}

const getDamageScore = ({
  weak,
  tva,
  minutesPct,
}) => {
  if (!weak) return 0

  const depth = Math.abs(Math.min(tva, 0))
  const weight = Math.max(toNum(minutesPct), 1) / 100

  return Number((depth * weight).toFixed(2))
}

const addMapEntry = ({
  acc,
  key,
  row,
}) => {
  if (key) {
    acc[key] = row
  }

  return acc
}

export const buildTeamInsightPlayersMap = rows => {
  const safeRows = Array.isArray(rows) ? rows : emptyArray

  return safeRows.reduce((acc, row) => {
    const playerId = getPid(row)
    const name = getName(row)

    addMapEntry({ acc, key: playerId, row })
    addMapEntry({ acc, key: name, row })

    return acc
  }, {})
}

export const buildTeamInsightPlayer = ({
  player = {},
  scoresMap = {},
} = {}) => {
  const playerId = getPid(player)
  const name = getName(player)
  const scoreRow = scoresMap[playerId] || scoresMap[name] || {}

  const ratingRaw = toNullableNum(scoreRow.ratingRaw)
  const tva = toNum(scoreRow.tva)
  const minutesPct = toNum(player.minutesPct ?? scoreRow.minutesPct)
  const weak = isWeakPlayer({ ratingRaw, tva })
  const top = isTopPlayer({ ratingRaw, tva })

  const primaryPosition =
    getPrimaryPosition(player) ||
    getPrimaryPosition(scoreRow)

  const positionId =
    asText(player.positionId) ||
    asText(player.primaryPosition) ||
    asText(scoreRow.positionId) ||
    primaryPosition

  const positionLabel =
    asText(player.positionLabel) ||
    asText(scoreRow.positionLabel) ||
    primaryPosition

  return {
    id: playerId || name,
    playerId,
    playerFullName: name,
    photo: player.photo || scoreRow.photo || '',

    squadRole: player.squadRole || scoreRow.squadRole || '',
    squadRoleLabel: player.squadRoleLabel || scoreRow.squadRoleLabel || '',

    primaryPosition,
    positionId,
    positionLabel,

    layerKey: player.layerKey || scoreRow.layerKey || '',
    layerLabel: player.layerLabel || scoreRow.layerLabel || '',

    projectStatus: player.projectStatus || scoreRow.projectStatus || '',
    projectStatusLabel: player.projectStatusLabel || scoreRow.projectStatusLabel || '',

    ratingRaw,
    ratingLabel: fmtRating(ratingRaw),

    tva,
    tvaLabel: fmtTva(tva),
    tvaTone: getTvaTone(tva),

    minutes: toNum(scoreRow.minutes || player.minutes),
    minutesPct,
    games: toNum(scoreRow.games || player.games),

    goals: toNum(scoreRow.goals || player.goals),
    assists: toNum(scoreRow.assists || player.assists),
    involvement: toNum(scoreRow.involvement || player.involvement),

    profile: scoreRow.profile || '',
    insightId: scoreRow.insightId || '',
    insightLabel: scoreRow.insightLabel || '',
    subStatus: scoreRow.subStatus || '',

    isWeak: weak,
    isTop: top,
    damageScore: getDamageScore({
      weak,
      tva,
      minutesPct,
    }),
  }
}
