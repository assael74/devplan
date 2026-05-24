// src/features/hub/clubProfile/sharedLogic/profileData/clubPlayersScoring.model.js

import {
  buildPlayerGamesBase,
  buildPlayerScoringModel,
  buildPlayerProfileInsightModel,
} from '../../../playerProfile/sharedLogic/profileData/index.js'

const emptyArray = []

const noSampleProfile = {
  id: 'insufficient_sample',
  label: 'אין מדגם',
  shortLabel: 'אין מדגם',
  tone: 'neutral',
  icon: 'pending',
}

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  const num = Number(value)

  return Number.isFinite(num) ? num : fallback
}

const getPlayerId = player => {
  return asText(player?.playerId || player?.id)
}

const getTeamId = item => {
  return asText(
    item?.teamId ||
      item?.team?.id ||
      item?.team?.teamId ||
      item?.player?.teamId ||
      item?.player?.team?.id ||
      ''
  )
}

const findPlayerTeam = ({ player, teamsById }) => {
  const teamId = getTeamId(player)

  return teamsById?.[teamId] || null
}

const getPlayerRatingValue = ({ scoring } = {}) => {
  const summary = scoring?.summary || {}

  return (
    summary?.ratingRaw ??
    summary?.rating ??
    summary?.avgRating ??
    null
  )
}

const getPlayerImpactValue = ({ scoring } = {}) => {
  const summary = scoring?.summary || {}

  return (
    summary?.tva ??
    summary?.cumulativeImpact ??
    summary?.totalImpact ??
    null
  )
}

const buildSummaryMeta = ({ scoring }) => {
  const summary = scoring?.summary || {}
  const meta = scoring?.meta || {}

  return {
    ratedGames: toNumber(meta?.ratedGames ?? summary?.ratedGames, 0),
    games: toNumber(meta?.gamesCount ?? summary?.scores, 0),
    scores: toNumber(meta?.scoresCount ?? summary?.scores, 0),

    goals: toNumber(summary?.goals, 0),
    assists: toNumber(summary?.assists, 0),
    involvement: toNumber(summary?.involvement, 0),
    totalMinutes: toNumber(summary?.totalMinutes, 0),
  }
}

const buildPlayerPerformanceSummary = scoring => {
  const rating = getPlayerRatingValue({ scoring })
  const impact = getPlayerImpactValue({ scoring })

  return {
    rating: toNumber(rating, null),
    ratingRaw: toNumber(rating, null),
    avgRating: toNumber(rating, null),

    tva: toNumber(impact, null),
    cumulativeImpact: toNumber(impact, null),
    totalImpact: toNumber(impact, null),

    ...buildSummaryMeta({ scoring }),
  }
}

const getInsightProfile = insightModel => {
  return (
    insightModel?.profile ||
    insightModel?.insightProfile ||
    insightModel?.insight ||
    null
  )
}

const getInsightId = insightModel => {
  const profile = getInsightProfile(insightModel)

  return (
    profile?.id ||
    insightModel?.insightId ||
    insightModel?.profileId ||
    ''
  )
}

const getInsightLabel = insightModel => {
  const profile = getInsightProfile(insightModel)

  return (
    profile?.shortLabel ||
    profile?.label ||
    insightModel?.insightLabel ||
    insightModel?.profileLabel ||
    ''
  )
}

const normalizeInsightProfile = insightModel => {
  const profile = getInsightProfile(insightModel)
  const insightId = getInsightId(insightModel)
  const insightLabel = getInsightLabel(insightModel)
  const ready = Boolean(profile?.id || insightId)

  if (!ready) {
    return {
      ready: false,

      profile: noSampleProfile,
      insight: noSampleProfile,

      insightId: noSampleProfile.id,
      profileId: noSampleProfile.id,

      insightLabel: noSampleProfile.label,
      profileLabel: noSampleProfile.label,

      meta: {
        ...(insightModel?.meta || {}),
        reason: insightModel?.meta?.reason || 'insufficient_sample',
      },

      raw: insightModel || null,
    }
  }

  return {
    ready: true,

    profile,
    insight: profile,

    insightId,
    profileId: insightId,

    insightLabel,
    profileLabel: insightLabel,

    meta: insightModel?.meta || {},
    raw: insightModel || null,
  }
}

const buildPlayerPerformanceRow = ({
  player,
  team,
  calculationMode,
  coachAssessments,
}) => {
  const gamesBase = buildPlayerGamesBase({
    player,
    team,
  })

  const scoring = buildPlayerScoringModel({
    player,
    team,
    games: gamesBase?.playedPlayerGames || emptyArray,
    calculationMode,
    coachAssessments,
  })

  const summary = buildPlayerPerformanceSummary(scoring)

  const insightModel = buildPlayerProfileInsightModel({
    player,
    playerScoring: scoring,
    classificationMode: 'season',
  })

  const insightProfile = normalizeInsightProfile(insightModel)

  return {
    playerId: getPlayerId(player),
    teamId: getTeamId(player),

    player,
    team,

    games: gamesBase,
    scoring,
    summary,

    playerInsight: insightProfile,
    insightProfile,
    profile: insightProfile.profile,

    insightId: insightProfile.insightId,
    insightLabel: insightProfile.insightLabel,

    rows: scoring?.rows || emptyArray,
    points: scoring?.points || emptyArray,
    byGameId: scoring?.byGameId || {},

    trend: scoring?.trend || {
      points: scoring?.points || emptyArray,
      byGameId: scoring?.byGameId || {},
    },

    meta: {
      ready: true,
      source: 'clubProfile.playerScoring.adapter',
      calculationMode,
      gamesCount: gamesBase?.counts?.playedPlayerGames || 0,
      scoresCount: scoring?.meta?.scoresCount || 0,
      ratedGames: summary?.ratedGames || 0,
      hasTrend: Boolean(scoring?.meta?.hasTrend),
      insightReady: insightProfile.ready,
      insightReason: insightProfile?.meta?.reason || '',
    },
  }
}

const buildById = rows => {
  return rows.reduce((acc, row) => {
    if (row?.playerId) {
      acc[row.playerId] = row
    }

    return acc
  }, {})
}

export const buildClubPlayersScoringModel = ({
  players,
  teamsById,
  calculationMode = 'games',
  coachAssessments = {},
} = {}) => {
  const safePlayers = Array.isArray(players) ? players : emptyArray

  const rows = safePlayers.map(player => {
    return buildPlayerPerformanceRow({
      player,
      team: findPlayerTeam({
        player,
        teamsById,
      }),
      calculationMode,
      coachAssessments,
    })
  })

  return {
    rows,
    byId: buildById(rows),

    meta: {
      ready: true,
      source: 'clubProfile.playersScoring',
      calculationMode,
      playersCount: safePlayers.length,
      scoredPlayers: rows.filter(row => row?.meta?.ratedGames > 0).length,
    },
  }
}
