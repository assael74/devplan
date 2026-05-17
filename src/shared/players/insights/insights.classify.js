// src/shared/players/insights/insights.classify.js

/*
|--------------------------------------------------------------------------
| Player Insights Engine / Classifier
|--------------------------------------------------------------------------
|
| אחריות:
| סיווג שחקן לפרופיל ביצוע בפועל.
|
| חשוב:
| זהו פלט מערכת, לא מעמד מאמן.
| לכן התוויות לא משתמשות במונחים כמו "שחקן מפתח",
| "שחקן רוטציה" או "שולי סגל".
*/

import {
  toNumber,
} from '../scoring/scoring.utils.js'

import {
  PLAYER_INSIGHTS_THRESHOLDS,
} from './insights.config.js'

import {
  PLAYER_INSIGHT_PROFILES,
} from './insights.profiles.js'

const getScopedTvaThreshold = ({
  scopeGames,
  perGame,
  floor,
}) => {
  const games = toNumber(scopeGames, 0)
  const valuePerGame = toNumber(perGame, 0)
  const minFloor = toNumber(floor, 0)

  if (!games || games <= 0 || !valuePerGame) {
    return minFloor
  }

  return Math.max(
    minFloor,
    Number((games * valuePerGame).toFixed(2))
  )
}

const getScopedMinutesThreshold = ({
  scopeMaxMinutes,
  pct,
  floor,
}) => {
  const maxMinutes = toNumber(scopeMaxMinutes, 0)
  const minFloor = toNumber(floor, 0)
  const ratio = toNumber(pct, 0)

  if (!maxMinutes || maxMinutes <= 0 || !ratio) {
    return minFloor
  }

  return Math.max(
    minFloor,
    Math.round(maxMinutes * ratio)
  )
}

const resolveThresholds = ({
  mode,
  scopeGames,
  scopeMaxMinutes,
}) => {
  const t = PLAYER_INSIGHTS_THRESHOLDS
  const s = t.scope || {}

  if (mode !== 'scope') {
    return t
  }

  return {
    ...t,

    statAnchorTva: getScopedTvaThreshold({
      scopeGames,
      perGame: s.statAnchorTvaPerGame,
      floor: s.minStatAnchorTva,
    }),

    hardOutOfSampleMinutes: getScopedMinutesThreshold({
      scopeMaxMinutes,
      pct: s.hardOutOfSamplePct,
      floor: s.minHardOutOfSampleMinutes,
    }),

    softOutOfSampleMinutes: getScopedMinutesThreshold({
      scopeMaxMinutes,
      pct: s.softOutOfSamplePct,
      floor: s.minSoftOutOfSampleMinutes,
    }),

    reliableMinutes: getScopedMinutesThreshold({
      scopeMaxMinutes,
      pct: s.reliablePct,
      floor: s.minReliableMinutes,
    }),

    strongMinutes: getScopedMinutesThreshold({
      scopeMaxMinutes,
      pct: s.strongPct,
      floor: s.minStrongMinutes,
    }),

    coreMinutes: getScopedMinutesThreshold({
      scopeMaxMinutes,
      pct: s.corePct,
      floor: s.minCoreMinutes,
    }),

    heavyMinutes: getScopedMinutesThreshold({
      scopeMaxMinutes,
      pct: s.heavyPct,
      floor: s.minHeavyMinutes,
    }),

    highMinutes: getScopedMinutesThreshold({
      scopeMaxMinutes,
      pct: s.highPct,
      floor: s.minHighMinutes,
    }),

    jokerMinMinutes: getScopedMinutesThreshold({
      scopeMaxMinutes,
      pct: s.jokerMinPct,
      floor: s.minJokerMinutes,
    }),

    jokerMaxMinutes: getScopedMinutesThreshold({
      scopeMaxMinutes,
      pct: s.jokerMaxPct,
      floor: s.minJokerMinutes,
    }),
  }
}

export const classifyPlayerInsight = ({
  ratingRaw,
  tva,
  minutes,
  std,
  range,
  min,
  mode = 'season',
  scopeMaxMinutes = null,
  scopeGames = null,
} = {}) => {
  const safeRating = toNumber(ratingRaw, null)
  const safeTva = toNumber(tva, null)
  const safeMinutes = toNumber(minutes, 0)
  const safeStd = toNumber(std, 0)
  const safeRange = toNumber(range, 0)
  const safeMin = toNumber(min, 6)

  const hasRating = Number.isFinite(safeRating)
  const hasTva = Number.isFinite(safeTva)

  if (!hasRating || !hasTva) {
    return PLAYER_INSIGHT_PROFILES.out_of_sample
  }

  const t = resolveThresholds({
    mode,
    scopeGames,
    scopeMaxMinutes,
  })

  const isHardOutOfSample =
    safeMinutes < t.hardOutOfSampleMinutes

  const isSoftOutOfSample =
    safeMinutes < t.softOutOfSampleMinutes &&
    safeRating < 6.05 &&
    safeTva <= 0.1

  const isReliableSample =
    safeMinutes >= t.reliableMinutes

  const isStrongSample =
    safeMinutes >= t.strongMinutes

  const isHeavyMinutes =
    safeMinutes >= t.heavyMinutes

  const isCoreMinutes =
    safeMinutes >= (t.coreMinutes || t.heavyMinutes)

  const isHighMinutes =
    safeMinutes >= t.highMinutes

  const isHighVolatility =
    safeStd >= t.volatilityStd ||
    safeRange >= t.volatilityRange

  const hasRealDownside =
    safeMin <= t.crashMinRating

  if (
    safeRating >= t.statAnchorRating &&
    safeTva >= t.statAnchorTva &&
    isHighMinutes
  ) {
    return PLAYER_INSIGHT_PROFILES.stat_anchor
  }

  if (
    safeRating >= t.jokerRating &&
    safeTva >= t.jokerMinTva &&
    safeMinutes >= t.jokerMinMinutes &&
    safeMinutes < t.jokerMaxMinutes
  ) {
    return PLAYER_INSIGHT_PROFILES.joker
  }

  if (
    (
      safeRating < t.weakSpotRating &&
      safeTva <= t.weakSpotTva &&
      isStrongSample
    ) ||
    (
      safeTva <= t.weakSpotHeavyTva &&
      isHeavyMinutes
    )
  ) {
    return PLAYER_INSIGHT_PROFILES.weak_spot
  }

  if (
    isHighVolatility &&
    hasRealDownside &&
    isReliableSample
  ) {
    return PLAYER_INSIGHT_PROFILES.unstable
  }

  if (isHardOutOfSample || isSoftOutOfSample) {
    return PLAYER_INSIGHT_PROFILES.out_of_sample
  }

  if (
    safeRating >= t.coreWorkerRating &&
    safeTva >= t.coreWorkerMinTva &&
    isCoreMinutes
  ) {
    return PLAYER_INSIGHT_PROFILES.core_worker
  }

  return PLAYER_INSIGHT_PROFILES.secondary_contributor
}
