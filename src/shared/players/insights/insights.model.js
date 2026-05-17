// src/shared/players/insights/insights.model.js

/*
|--------------------------------------------------------------------------
| Player Insights Engine / Model Builder
|--------------------------------------------------------------------------
|
| אחריות:
| בניית מודל תובנות שחקנים מתוך ציוני משחק.
|
| תרחישים:
| - פרופיל קבוצה / משחקים: כל השחקנים מתוך כל המשחקים.
| - פרופיל קבוצה / שחקנים: scope עונתי או תקופתי.
| - פרופיל שחקן / כללי: שחקן אחד מתוך scope.
*/

import {
  buildPlayerSeasonScore,
  buildScopedGameScores,
} from '../scoring/index.js'

import {
  roundNumber,
  toNumber,
} from '../scoring/scoring.utils.js'

import {
  buildPlayerInsightStats,
} from './insights.stats.js'

import {
  classifyPlayerInsight,
} from './insights.classify.js'

import {
  PLAYER_INSIGHT_PROFILES,
} from './insights.profiles.js'

const emptyArray = []

const PROFILE_ORDER = {
  stat_anchor: 1,
  core_worker: 2,
  weak_spot: 3,
  joker: 4,
  unstable: 5,
  secondary_contributor: 6,
  out_of_sample: 99,
}

const getGameObject = (row = {}) => {
  return row?.game || row || {}
}

const getGameDuration = ({ row, team } = {}) => {
  const game = getGameObject(row)

  const duration = toNumber(
    game?.gameDuration ??
    row?.gameDuration ??
    team?.leagueGameTime,
    null
  )

  if (Number.isFinite(duration) && duration > 0) {
    return duration
  }

  return 90
}

const buildInsightClassificationMeta = ({
  scopedScores,
  team,
  mode,
} = {}) => {
  const scopedGames = Array.isArray(scopedScores?.games)
    ? scopedScores.games
    : emptyArray

  const scopeMaxMinutes = scopedGames.reduce((sum, item) => {
    return sum + getGameDuration({
      row: item?.game,
      team,
    })
  }, 0)

  return {
    mode: mode || 'season',
    scopeGames: scopedGames.length,
    scopeMaxMinutes,
  }
}

const getPlayerPhoto = (item = {}) => {
  const player = item?.player || {}

  return (player.photo || '')
}

const getProfileOrder = (row = {}) => {
  return PROFILE_ORDER[row.insightId] || 50
}

const asText = (value) => {
  return value == null ? '' : String(value).trim()
}

const getPlayerName = (item = {}) => {
  const player = item?.player || {}

  return (player.playerFullName || '')
}

const groupScoresByPlayer = (scores = []) => {
  const safeScores = Array.isArray(scores) ? scores : emptyArray

  return safeScores.reduce((acc, item) => {
    const playerId = asText(item?.playerId)

    if (!playerId) return acc

    if (!acc[playerId]) {
      acc[playerId] = []
    }

    acc[playerId].push(item)

    return acc
  }, {})
}

const buildInsightFlags = ({
  profile,
  tva,
  std,
  range,
  min,
} = {}) => {
  const safeTva = toNumber(tva, 0)
  const safeStd = toNumber(std, 0)
  const safeRange = toNumber(range, 0)
  const safeMin = toNumber(min, 6)

  return {
    volatility:
      (
        safeStd >= 0.45 ||
        safeRange >= 1.4
      ) &&
      safeMin <= 5.3,

    coreMinus:
      profile?.id === PLAYER_INSIGHT_PROFILES.core_worker.id &&
      safeTva < 0,
  }
}

const buildSubStatus = ({
  profile,
  tva,
} = {}) => {
  const safeTva = toNumber(tva, 0)

  if (
    profile?.id === PLAYER_INSIGHT_PROFILES.core_worker.id &&
    safeTva < 0
  ) {
    return 'יציב, אבל במינוס'
  }

  return ''
}

export const buildPlayerInsightProfile = ({
  playerId,
  scores,
  classificationMeta
} = {}) => {
  const id = asText(playerId)
  const safeScores = Array.isArray(scores) ? scores : emptyArray

  const season = buildPlayerSeasonScore({
    playerId: id,
    scores: safeScores,
  })

  const ratedScores = Array.isArray(season?.scores)
    ? season.scores
    : emptyArray

  const first = ratedScores[0] || safeScores[0] || {}
  const stats = buildPlayerInsightStats(ratedScores)

  const profile = season?.ratedGames
    ? classifyPlayerInsight({
        ratingRaw: season?.seasonRatingRaw,
        tva: season?.tva,
        minutes: season?.ratedMinutes,
        std: stats.std,
        range: stats.range,
        min: stats.min,
        mode: classificationMeta?.mode || 'season',
        scopeMaxMinutes: classificationMeta?.scopeMaxMinutes,
        scopeGames: classificationMeta?.scopeGames,
      })
    : PLAYER_INSIGHT_PROFILES.out_of_sample

  const flags = buildInsightFlags({
    profile,
    tva: season?.tva,
    std: stats.std,
    range: stats.range,
    min: stats.min,
  })

  return {
    playerId: id,
    photo: getPlayerPhoto(first),

    playerFullName: getPlayerName(first),

    profile,
    insight: profile,
    insightId: profile.id,
    legacyInsightId: profile.legacyId,
    insightLabel: profile.label,

    subStatus: buildSubStatus({
      profile,
      tva: season?.tva,
    }),

    role: first?.score?.context?.roleId || '',
    positionLayer: first?.score?.context?.positionLayer || '',

    ratingRaw: season?.seasonRatingRaw ?? null,
    rating: season?.seasonRating ?? null,
    tva: season?.tva ?? 0,

    games: season?.ratedGames || 0,
    minutes: season?.ratedMinutes || 0,

    goals: stats.goals,
    assists: stats.assists,
    involvement: stats.involvement,

    avg: stats.avg,
    max: stats.max,
    min: stats.min,
    std: stats.std,
    range: stats.range,

    highGames: stats.highGames,
    lowGames: stats.lowGames,

    reliability: season?.reliability || null,
    reliabilityLabel: season?.reliability?.label || '',

    flags,

    seasonScore: season,
    scores: ratedScores,

    classificationMeta: classificationMeta || null,
    scopeGames: classificationMeta?.scopeGames || null,
    scopeMaxMinutes: classificationMeta?.scopeMaxMinutes || null,
  }
}

export const buildPlayersInsightsFromGameScores = ({
  scores,
  classificationMeta,
} = {}) => {
  const groupedByPlayer = groupScoresByPlayer(scores)

  return Object.keys(groupedByPlayer)
    .map((playerId) => {
      return buildPlayerInsightProfile({
        playerId,
        scores,
        classificationMeta,
      })
    })
    .sort((a, b) => {
      const profileDiff = getProfileOrder(a) - getProfileOrder(b)

      if (profileDiff !== 0) {
        return profileDiff
      }

      return toNumber(b.ratingRaw, 0) - toNumber(a.ratingRaw, 0)
    })
}

export const buildPlayersInsightsFromGames = ({
  games,
  team,
  calculationMode,
  scope,
  playerId,
  coachAssessments,
  classificationMode = 'season',
} = {}) => {
  const scopedScores = buildScopedGameScores({
    games,
    team,
    calculationMode,
    scope,
    playerId,
    coachAssessments,
  })

  const classificationMeta = buildInsightClassificationMeta({
    scopedScores,
    team,
    mode: classificationMode,
  })

  const rows = buildPlayersInsightsFromGameScores({
    scores: scopedScores?.flatScores || emptyArray,
    classificationMeta,
  })

  return {
    rows,

    scopedScores,
    classificationMeta,

    scope: scopedScores?.scope || null,

    counts: {
      allGames: scopedScores?.allGamesCount || 0,
      filteredGames: scopedScores?.filteredGamesCount || 0,
      scopedGames: scopedScores?.scopedGamesCount || 0,
      scores: scopedScores?.scoresCount || 0,
      players: rows.length,
    },

    summary: {
      avgRating: rows.length
        ? roundNumber(
            rows.reduce((sum, row) => {
              return sum + toNumber(row.ratingRaw, 0)
            }, 0) / rows.length,
            3
          )
        : null,

      totalTva: roundNumber(
        rows.reduce((sum, row) => {
          return sum + toNumber(row.tva, 0)
        }, 0),
        2
      ),

      totalMinutes: rows.reduce((sum, row) => {
        return sum + toNumber(row.minutes, 0)
      }, 0),
    },
  }
}
