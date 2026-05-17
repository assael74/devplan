// src/shared/players/insights/insights.debug.js

/*
|--------------------------------------------------------------------------
| Player Insights Engine / Debug
|--------------------------------------------------------------------------
|
| אחריות:
| הדפסת טבלאות בדיקה לקונסול.
|
| הקובץ מיועד לפיתוח וכיול בלבד.
| אין כאן לוגיקה מקצועית של סיווג.
*/

import {
  roundNumber,
  toNumber,
} from '../scoring/scoring.utils.js'

const buildCategoryRows = (rows = []) => {
  const categoryMap = rows.reduce((acc, row) => {
    const id = row.insightId || 'unknown'

    if (!acc[id]) {
      acc[id] = {
        insightId: id,
        legacyInsightId: row.legacyInsightId || '',
        insight: row.insightLabel || '',
        players: 0,
        ratingSum: 0,
        totalTva: 0,
        totalMinutes: 0,
      }
    }

    acc[id].players += 1
    acc[id].ratingSum += toNumber(row.ratingRaw, 0)
    acc[id].totalTva += toNumber(row.tva, 0)
    acc[id].totalMinutes += toNumber(row.minutes, 0)

    return acc
  }, {})

  return Object.values(categoryMap).map((row) => {
    return {
      insightId: row.insightId,
      legacyInsightId: row.legacyInsightId,
      insight: row.insight,
      players: row.players,
      avgRating: row.players
        ? roundNumber(row.ratingSum / row.players, 3)
        : null,
      totalTva: roundNumber(row.totalTva, 2),
      totalMinutes: row.totalMinutes,
    }
  })
}

const toTableRows = (rows = []) => {
  return rows.map((row) => {
    return {
      name: row.playerFullName,
      insight: row.insightLabel,
      legacy: row.legacyInsightId,
      subStatus: row.subStatus,
      role: row.role,
      pos: row.positionLayer,
      ratingRaw: row.ratingRaw,
      tva: row.tva,
      minutes: row.minutes,
      games: row.games,
      goals: row.goals,
      assists: row.assists,
      inv: row.involvement,
      std: row.std,
      range: row.range,
      min: row.min,
      max: row.max,
      high: row.highGames,
      low: row.lowGames,
      reliability: row.reliabilityLabel,
    }
  })
}

export const printPlayersInsightsDebug = ({
  rows,
  scopedScores,
  counts,
} = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const safeCounts = counts || {}

  console.clear()

  console.log('PLAYER SCORING / SCOPE')
  console.table([
    {
      scopedGames:
        safeCounts.scopedGames ??
        scopedScores?.scopedGamesCount ??
        0,

      playerScores:
        safeCounts.scores ??
        scopedScores?.scoresCount ??
        scopedScores?.flatScores?.length ??
        0,

      players:
        safeCounts.players ??
        safeRows.length,
    },
  ])

  console.log('PLAYER INSIGHTS / FULL CLASSIFICATION')
  console.table(toTableRows(safeRows))

  console.log('PLAYER INSIGHTS / BY CATEGORY')
  console.table(buildCategoryRows(safeRows))

  console.log('PLAYER INSIGHTS / STAT ANCHORS')
  console.table(
    toTableRows(
      safeRows.filter((row) => {
        return row.insightId === 'stat_anchor'
      })
    )
  )

  console.log('PLAYER INSIGHTS / WEAK SPOTS')
  console.table(
    toTableRows(
      safeRows.filter((row) => {
        return row.insightId === 'weak_spot'
      })
    )
  )

  console.log('PLAYER INSIGHTS / UNSTABLE')
  console.table(
    toTableRows(
      safeRows.filter((row) => {
        return row.insightId === 'unstable'
      })
    )
  )

  console.log('PLAYER INSIGHTS / SECONDARY CONTRIBUTORS')
  console.table(
    toTableRows(
      safeRows.filter((row) => {
        return row.insightId === 'secondary_contributor'
      })
    )
  )

  console.log('PLAYER INSIGHTS / CORE WORKERS')
  console.table(
    toTableRows(
      safeRows.filter((row) => {
        return row.insightId === 'core_worker'
      })
    )
  )
}
