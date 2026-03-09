// shared/games/games.normalize.logic.js

import { safe, normalizeDate, normalizeTime } from './games.time.logic.js'
import { typeLabelH, diffLabelH } from './games.labels.js'
import { scoreFromGameAndStats } from './games.score.logic.js'

const calcResultByGoals = (goalsFor, goalsAgainst) => {
  const gf = Number(goalsFor)
  const ga = Number(goalsAgainst)

  if (!Number.isFinite(gf) || !Number.isFinite(ga)) return ''
  if (gf > ga) return 'win'
  if (gf < ga) return 'loss'
  return 'draw'
}

const calcPointsByResult = (result, goalsFor, goalsAgainst) => {
  const r = safe(result).trim().toLowerCase()

  if (r === 'win') return 3
  if (r === 'draw') return 1
  if (r === 'loss') return 0

  const byGoals = calcResultByGoals(goalsFor, goalsAgainst)
  if (byGoals === 'win') return 3
  if (byGoals === 'draw') return 1
  if (byGoals === 'loss') return 0

  return 0
}

export const createGameRowNormalizer = (cfg) => {
  const pick = cfg?.pick || {}
  const formatDateH = cfg?.formatDateH || ((dateRaw) => dateRaw || '')

  const pickId = pick.pickId || ((row) => safe(row?.id))
  const pickGame = pick.pickGame || ((row) => row?.game || row || {})
  const pickStats = pick.pickStats || ((row) => row?.stats || row || {})

  const pickType =
    pick.pickType ||
    ((game) => safe(game?.type).toLowerCase().trim() || 'friendly')

  const pickDifficulty =
    pick.pickDifficulty ||
    ((game) => safe(game?.difficulty).toLowerCase().trim())

  const pickDateRaw =
    pick.pickDateRaw ||
    ((game) => normalizeDate(game?.gameDate))

  const pickHourRaw =
    pick.pickHourRaw ||
    ((game) => normalizeTime(game?.gameHour))

  const pickRival =
    pick.pickRival ||
    ((game) => safe(game?.rivel || game?.rival || game?.rivalName || game?.opponent).trim() || '—')

  const pickIsHome =
    pick.pickIsHome ||
    ((game) => !!game?.home)

  const pickResult =
    pick.pickResult ||
    ((game) => {
      const direct = safe(game?.result).trim()
      if (direct) return direct

      return calcResultByGoals(game?.goalsFor, game?.goalsAgainst)
    })

  const pickPoints =
    pick.pickPoints ||
    ((stats, game) => {
      const direct = Number(stats?.points ?? game?.points)
      if (Number.isFinite(direct)) return direct

      return calcPointsByResult(game?.result, game?.goalsFor, game?.goalsAgainst)
    })

  const pickScore =
    pick.pickScore ||
    ((game, stats) => {
      const gf = Number(game?.goalsFor)
      const ga = Number(game?.goalsAgainst)

      if (Number.isFinite(gf) && Number.isFinite(ga)) {
        return `${gf} - ${ga}`
      }

      return scoreFromGameAndStats({ game, stats })
    })

  return (row) => {
    const game = pickGame(row)
    const stats = pickStats(row)

    const id = safe(pickId(row)) || safe(game?.id)
    const t = pickType(game)
    const diff = pickDifficulty(game)

    const dateRaw = pickDateRaw(game)
    const hourRaw = pickHourRaw(game)

    return {
      id,
      game,
      stats,

      type: t,
      typeH: typeLabelH(t),

      difficulty: diff,
      difficultyH: diffLabelH(diff),

      dateRaw,
      hourRaw,

      rival: pickRival(game),
      isHome: pickIsHome(game),

      score: pickScore(game, stats),
      result: pickResult(game),
      points: pickPoints(stats, game),

      dateH: formatDateH(dateRaw),
    }
  }
}
