// teamProfile/sharedLogic/players/insightsLogic/performance/performanceScope.logic.js

import {
  buildPlayersInsightsFromGames,
} from '../../../../../../../shared/players/insights/index.js'

const emptyArray = []
const MIN_SCOPE_GAMES = 5

export const getGameKey = (game) => {
  const g = game?.game || game || {}

  return g?.id ||
    g?.gameId ||
    `${g?.gameDate || ''}_${g?.gameLeagueNum || ''}_${g?.rivel || g?.rival || ''}`
}

export const getGameTime = (game) => {
  const g = game?.game || game || {}
  const time = new Date(g?.gameDate).getTime()

  return Number.isFinite(time) ? time : 0
}

export const isPlayedLeagueGame = (game) => {
  const g = game?.game || game || {}

  const type = g?.type
  const status = g?.gameStatus

  const isLeague =
    !type ||
    type === 'league'

  const isPlayed =
    !status ||
    status === 'played'

  return isLeague && isPlayed
}

export const getOrderedSeasonGames = (games) => {
  const safeGames = Array.isArray(games) ? games : emptyArray

  const orderedGames = safeGames
    .filter(isPlayedLeagueGame)
    .sort((a, b) => {
      return getGameTime(a) - getGameTime(b)
    })

  if (orderedGames.length) {
    return orderedGames
  }

  return safeGames
    .slice()
    .sort((a, b) => {
      return getGameTime(a) - getGameTime(b)
    })
}

export const getScopedGames = ({
  games,
  performanceScope,
}) => {
  const orderedGames = getOrderedSeasonGames(games)

  if (
    performanceScope?.mode === 'range' &&
    performanceScope?.fromGameKey &&
    performanceScope?.toGameKey
  ) {
    const fromIndex = orderedGames.findIndex((game) => {
      return getGameKey(game) === performanceScope.fromGameKey
    })

    const toIndex = orderedGames.findIndex((game) => {
      return getGameKey(game) === performanceScope.toGameKey
    })

    if (fromIndex < 0 || toIndex < 0) {
      return orderedGames
    }

    const start = Math.min(fromIndex, toIndex)
    const end = Math.max(fromIndex, toIndex)
    const rangeGames = orderedGames.slice(start, end + 1)

    if (rangeGames.length < MIN_SCOPE_GAMES) {
      return orderedGames
    }

    return rangeGames
  }

  return orderedGames
}

const getPlayerKey = (row) => {
  return row?.playerId ||
    row?.id ||
    row?.player?.id ||
    row?.player?.playerId ||
    row?.playerFullName ||
    row?.name
}

const buildRowsMap = (rows) => {
  const safeRows = Array.isArray(rows) ? rows : emptyArray

  return safeRows.reduce((acc, row) => {
    const key = getPlayerKey(row)

    if (key) {
      acc[key] = row
    }

    return acc
  }, {})
}

const isSeasonScope = (performanceScope) => {
  return !performanceScope ||
    !performanceScope.mode ||
    performanceScope.mode === 'season'
}

export const buildPlayerPerformance = ({
  games,
  team,
  calculationMode,
  classificationMode = 'season',
}) => {
  const safeGames = Array.isArray(games) ? games : emptyArray

  if (!safeGames.length) return null

  return buildPlayersInsightsFromGames({
    games: safeGames,
    team,
    calculationMode,
    classificationMode,
    scope: {
      gameTypes: ['league'],
      playedOnly: true,
      limit: null,
      dateFrom: null,
      dateTo: null,
      sortDirection: 'desc',
    },
  })
}

const mergeScopedMetrics = ({
  seasonRow,
  scopedRow,
}) => {
  return {
    ...seasonRow,

    ratingRaw: scopedRow.ratingRaw,
    rating: scopedRow.rating,
    tva: scopedRow.tva,

    games: scopedRow.games,
    minutes: scopedRow.minutes,

    goals: scopedRow.goals,
    assists: scopedRow.assists,
    involvement: scopedRow.involvement,

    avg: scopedRow.avg,
    max: scopedRow.max,
    min: scopedRow.min,
    std: scopedRow.std,
    range: scopedRow.range,

    highGames: scopedRow.highGames,
    lowGames: scopedRow.lowGames,

    reliability: scopedRow.reliability,
    reliabilityLabel: scopedRow.reliabilityLabel,

    scores: scopedRow.scores,
    seasonScore: scopedRow.seasonScore,

    seasonInsightId: seasonRow.insightId,
    seasonInsightLabel: seasonRow.insightLabel,
    seasonProfile: seasonRow.profile,
    seasonSubStatus: seasonRow.subStatus,

    scopedInsightId: scopedRow.insightId,
    scopedInsightLabel: scopedRow.insightLabel,
    scopedProfile: scopedRow.profile,
    scopedSubStatus: scopedRow.subStatus,

    subStatus: scopedRow.subStatus,
  }
}

export const mergeSeasonProfileWithScopedMetrics = ({
  seasonRows,
  scopedRows,
  performanceScope,
}) => {
  const safeSeasonRows = Array.isArray(seasonRows) ? seasonRows : emptyArray

  if (isSeasonScope(performanceScope)) {
    return safeSeasonRows.map((row) => {
      return {
        ...row,

        seasonInsightId: row.insightId,
        seasonInsightLabel: row.insightLabel,
        seasonProfile: row.profile,
        seasonSubStatus: row.subStatus,

        scopedInsightId: row.insightId,
        scopedInsightLabel: row.insightLabel,
        scopedProfile: row.profile,
        scopedSubStatus: row.subStatus,
      }
    })
  }

  const scopedRowsMap = buildRowsMap(scopedRows)

  return safeSeasonRows.map((seasonRow) => {
    const key = getPlayerKey(seasonRow)
    const scopedRow = scopedRowsMap[key]

    if (!scopedRow) {
      return {
        ...seasonRow,

        scopedMissing: true,

        seasonInsightId: seasonRow.insightId,
        seasonInsightLabel: seasonRow.insightLabel,
        seasonProfile: seasonRow.profile,
        seasonSubStatus: seasonRow.subStatus,

        scopedInsightId: null,
        scopedInsightLabel: null,
        scopedProfile: null,
        scopedSubStatus: 'לא נמצא במדגם המשחקים שנבחר',

        ratingRaw: null,
        rating: null,
        tva: 0,
        games: 0,
        minutes: 0,
        goals: 0,
        assists: 0,
        involvement: 0,

        subStatus: 'לא נמצא במדגם המשחקים שנבחר',
      }
    }

    return mergeScopedMetrics({
      seasonRow,
      scopedRow,
    })
  })
}

const getScopeLabel = (performanceScope) => {
  if (!performanceScope || performanceScope.mode === 'season') {
    return 'כל השנה'
  }

  if (performanceScope.mode === 'range') {
    return 'טווח משחקים'
  }

  return 'סקופ נבחר'
}

const toDebugRow = ({
  seasonRow,
  scopedRow,
  mergedRow,
}) => {
  return {
    name:
      mergedRow?.playerFullName ||
      seasonRow?.playerFullName ||
      scopedRow?.playerFullName ||
      '',

    seasonProfile: seasonRow?.insightLabel || '',
    scopedProfile: scopedRow?.insightLabel || '',
    shownProfile: mergedRow?.insightLabel || '',

    seasonRating: seasonRow?.ratingRaw ?? null,
    scopedRating: scopedRow?.ratingRaw ?? null,
    shownRating: mergedRow?.ratingRaw ?? null,

    seasonTva: seasonRow?.tva ?? null,
    scopedTva: scopedRow?.tva ?? null,
    shownTva: mergedRow?.tva ?? null,

    seasonGames: seasonRow?.games ?? null,
    scopedGames: scopedRow?.games ?? null,
    shownGames: mergedRow?.games ?? null,

    seasonMinutes: seasonRow?.minutes ?? null,
    scopedMinutes: scopedRow?.minutes ?? null,
    shownMinutes: mergedRow?.minutes ?? null,

    scopedSubStatus: scopedRow?.subStatus || '',
    shownSubStatus: mergedRow?.subStatus || '',
  }
}

export const printPlayerPerformanceScopeDebug = ({
  seasonPlayerPerformance,
  scopedPlayerPerformance,
  mergedRows,
  performanceScope,
} = {}) => {
  const seasonRows = Array.isArray(seasonPlayerPerformance?.rows)
    ? seasonPlayerPerformance.rows
    : emptyArray

  const scopedRows = Array.isArray(scopedPlayerPerformance?.rows)
    ? scopedPlayerPerformance.rows
    : emptyArray

  const safeMergedRows = Array.isArray(mergedRows)
    ? mergedRows
    : emptyArray

  const seasonMap = buildRowsMap(seasonRows)
  const scopedMap = buildRowsMap(scopedRows)

  console.log(`PLAYER PERFORMANCE SCOPE / ${getScopeLabel(performanceScope)}`)

  console.table([
    {
      scopeMode: performanceScope?.mode || 'season',

      seasonGames: seasonPlayerPerformance?.counts?.scopedGames || 0,
      scopedGames: scopedPlayerPerformance?.counts?.scopedGames || 0,

      seasonPlayers: seasonRows.length,
      scopedPlayers: scopedRows.length,
      shownPlayers: safeMergedRows.length,
    },
  ])

  console.log('PLAYER PERFORMANCE / MERGED VIEW')
  console.table(
    safeMergedRows.map((mergedRow) => {
      const key = getPlayerKey(mergedRow)

      return toDebugRow({
        seasonRow: seasonMap[key],
        scopedRow: scopedMap[key],
        mergedRow,
      })
    })
  )

  console.log('PLAYER PERFORMANCE / SCOPED ONLY')
  console.table(
    scopedRows.map((row) => {
      return {
        name: row.playerFullName,
        scopedProfile: row.insightLabel,
        rating: row.ratingRaw,
        tva: row.tva,
        games: row.games,
        minutes: row.minutes,
        goals: row.goals,
        assists: row.assists,
        inv: row.involvement,
        std: row.std,
        range: row.range,
        subStatus: row.subStatus,
      }
    })
  )
}
