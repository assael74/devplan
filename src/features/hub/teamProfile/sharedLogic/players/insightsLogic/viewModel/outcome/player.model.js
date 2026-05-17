// TEAMPROFILE/sharedLogic/players/insightsLogic/viewModel/outcome/player.model.js

import {
  OUTCOME_THRESHOLDS,
} from './constants.js'

const toNum = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const toNullableNum = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const getPid = player => {
  return player?.playerId ||
    player?.id ||
    player?.player?.id ||
    player?.player?.playerId ||
    ''
}

const getName = player => {
  return player?.playerFullName ||
    player?.fullName ||
    player?.name ||
    player?.player?.playerFullName ||
    'שחקן'
}

const getPrimaryPosition = player => {
  return player?.primaryPosition ||
    player?.positionId ||
    player?.positionLabel ||
    player?.generalPositionKey ||
    ''
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

const isWeak = ({
  ratingRaw,
  tva,
}) => {
  if (ratingRaw !== null && ratingRaw < OUTCOME_THRESHOLDS.weakRatingBelow) {
    return true
  }

  return tva < OUTCOME_THRESHOLDS.weakTvaBelow
}

const isTop = ({
  ratingRaw,
  tva,
}) => {
  if (ratingRaw === null) return false

  return (
    ratingRaw >= OUTCOME_THRESHOLDS.topRatingFrom &&
    tva >= OUTCOME_THRESHOLDS.topTvaFrom
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

export const buildPerfMap = rows => {
  const safeRows = Array.isArray(rows) ? rows : []

  return safeRows.reduce((acc, row) => {
    const pid = getPid(row)
    const name = getName(row)

    if (pid) acc[pid] = row
    if (name) acc[name] = row

    return acc
  }, {})
}

export const toOutcomePlayer = ({
  player = {},
  perfMap = {},
} = {}) => {
  const playerId = getPid(player)
  const name = getName(player)
  const perf = perfMap[playerId] || perfMap[name] || {}

  const ratingRaw = toNullableNum(perf.ratingRaw)
  const tva = toNum(perf.tva)
  const minutesPct = toNum(player.minutesPct ?? perf.minutesPct)
  const weak = isWeak({ ratingRaw, tva })
  const top = isTop({ ratingRaw, tva })

  const primaryPosition = getPrimaryPosition(player) || getPrimaryPosition(perf)

  return {
    id: playerId || name,
    playerId,
    playerFullName: name,
    photo: player.photo || perf.photo || '',

    squadRole: player.squadRole || perf.squadRole || '',
    squadRoleLabel: player.squadRoleLabel || perf.squadRoleLabel || '',

    primaryPosition,
    positionId: primaryPosition || player.primaryPosition || perf.positionId || '',
    positionLabel: player.positionLabel || perf.positionLabel || primaryPosition || '',
    layerKey: player.layerKey || perf.layerKey || '',
    layerLabel: player.layerLabel || perf.layerLabel || '',

    ratingRaw,
    ratingLabel: fmtRating(ratingRaw),

    tva,
    tvaLabel: fmtTva(tva),
    tvaTone: getTvaTone(tva),

    minutes: toNum(perf.minutes || player.minutes),
    minutesPct,
    games: toNum(perf.games || player.games),

    goals: toNum(perf.goals || player.goals),
    assists: toNum(perf.assists || player.assists),
    involvement: toNum(perf.involvement || player.involvement),

    profile: perf.profile || '',
    insightId: perf.insightId || '',
    insightLabel: perf.insightLabel || '',
    subStatus: perf.subStatus || '',

    isWeak: weak,
    isTop: top,
    damageScore: getDamageScore({
      weak,
      tva,
      minutesPct,
    }),
  }
}
