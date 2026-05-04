// shared/games/games.normalize.logic.js

import { safe, normalizeDate, normalizeTime } from './games.time.logic.js'
import {
  typeLabelH,
  diffLabelH,
  resultLabelH,
  homeLabelH,
} from './games.labels.js'
import { scoreFromGameAndStats } from './games.score.logic.js'
import { isGamePlayed } from './games.constants.js'

const toNum = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

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

const mapHomeToKey = (game) => {
  if (typeof game?.home === 'boolean') return game.home ? 'home' : 'away'

  const homeAway = safe(game?.homeAway).trim().toLowerCase()
  const typePlace = safe(game?.typePlace).trim().toLowerCase()

  if (homeAway === 'home' || typePlace === 'home') return 'home'
  if (homeAway === 'away' || typePlace === 'away') return 'away'

  return ''
}

const pickGameStatusDefault = (row = {}, game = {}, stats = {}) => {
  return safe(
    row?.gameStatus ??
      game?.gameStatus ??
      game?.game?.gameStatus ??
      stats?.gameStatus ??
      row?.raw?.gameStatus
  )
    .trim()
    .toLowerCase()
}

export const createGameRowNormalizer = (cfg) => {
  const pick = cfg?.pick || {}
  const formatDateH = cfg?.formatDateH || ((dateRaw) => dateRaw || '')

  const pickId = pick.pickId || ((row) => safe(row?.id))
  const pickGame = pick.pickGame || ((row) => row?.game || row || {})
  const pickStats = pick.pickStats || ((row) => row?.stats || row || {})

  const pickGameStatus =
    pick.pickGameStatus ||
    ((row, game, stats) => pickGameStatusDefault(row, game, stats))

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
    ((game) =>
      safe(game?.rivel || game?.rival || game?.rivalName || game?.opponent).trim() || '—')

  const pickGoalsFor =
    pick.pickGoalsFor ||
    ((game, stats) => {
      const val = stats?.goalsFor ?? game?.goalsFor
      return toNum(val, 0)
    })

  const pickGoalsAgainst =
    pick.pickGoalsAgainst ||
    ((game, stats) => {
      const val = stats?.goalsAgainst ?? game?.goalsAgainst
      return toNum(val, 0)
    })

  const pickResult =
    pick.pickResult ||
    ((game, stats, played) => {
      if (!played) return ''

      const direct = safe(stats?.result ?? game?.result).trim().toLowerCase()
      if (direct === 'win' || direct === 'draw' || direct === 'loss') return direct

      const gf = pickGoalsFor(game, stats)
      const ga = pickGoalsAgainst(game, stats)
      return calcResultByGoals(gf, ga)
    })

  const pickPoints =
    pick.pickPoints ||
    ((stats, game, played) => {
      if (!played) return 0

      const direct = Number(stats?.points ?? game?.points)
      if (Number.isFinite(direct)) return direct

      const gf = pickGoalsFor(game, stats)
      const ga = pickGoalsAgainst(game, stats)
      return calcPointsByResult(stats?.result ?? game?.result, gf, ga)
    })

  const pickScore =
    pick.pickScore ||
    ((game, stats, played) => {
      if (!played) return ''

      const gf = pickGoalsFor(game, stats)
      const ga = pickGoalsAgainst(game, stats)

      const hasDirect =
        stats?.goalsFor != null ||
        stats?.goalsAgainst != null ||
        game?.goalsFor != null ||
        game?.goalsAgainst != null

      if (hasDirect) return `${gf} - ${ga}`
      return scoreFromGameAndStats({ game, stats })
    })

  const pickGameDuration =
    pick.pickGameDuration ||
    ((game) => {
      const duration = Number(game?.gameDuration ?? game?.duration)
      return Number.isFinite(duration) && duration > 0 ? duration : 90
    })

  const pickTimePlayed =
    pick.pickTimePlayed ||
    ((row, game, stats) => {
      const val =
        row?.timePlayed ??
        stats?.timePlayed ??
        row?.minutesPlayed ??
        stats?.minutesPlayed ??
        row?.minutes ??
        stats?.minutes

      return toNum(val, 0)
    })

  const pickGoals =
    pick.pickGoals ||
    ((row, game, stats) => toNum(row?.goals ?? stats?.goals, 0))

  const pickAssists =
    pick.pickAssists ||
    ((row, game, stats) => toNum(row?.assists ?? stats?.assists, 0))

  const pickIsStarting =
    pick.pickIsStarting ||
    ((row, game, stats) => {
      if (row?.isStarting === true || stats?.isStarting === true) return true
      if (row?.isStarting === false || stats?.isStarting === false) return false
      if (row?.lineup === true || stats?.lineup === true) return true
      if (row?.starter === true || stats?.starter === true) return true
      return false
    })

  return (row) => {
    const game = pickGame(row)
    const stats = pickStats(row)

    const id = safe(pickId(row)) || safe(game?.id)
    const type = pickType(game)
    const difficulty = pickDifficulty(game)

    const rawGameStatus = pickGameStatus(row, game, stats)
    const gameStatus = rawGameStatus || 'scheduled'
    const played = isGamePlayed({ gameStatus })

    const dateRaw = pickDateRaw(game)
    const hourRaw = pickHourRaw(game)

    const goalsFor = pickGoalsFor(game, stats)
    const goalsAgainst = pickGoalsAgainst(game, stats)
    const result = pickResult(game, stats, played)
    const points = pickPoints(stats, game, played)

    const gameDuration = pickGameDuration(game)
    const timePlayed = pickTimePlayed(row, game, stats)
    const goals = pickGoals(row, game, stats)
    const assists = pickAssists(row, game, stats)
    const isStarting = pickIsStarting(row, game, stats)

    const homeKey = mapHomeToKey(game)
    const isHome = homeKey === 'home'

    const vLink = safe(row?.vLink || game?.vLink).trim()
    const hasVideo = !!vLink
    const videoIcon = hasVideo ? 'video' : 'noVideo'
    const videoColor = hasVideo ? '#3cfa06' : '#fa1606'

    return {
      id,
      game: {
        ...game,
        gameStatus,
        rawGameStatus,
      },
      stats,

      rawGameStatus,
      gameStatus,

      type,
      typeH: typeLabelH(type),

      difficulty,
      difficultyH: diffLabelH(difficulty),

      dateRaw,
      hourRaw,
      dateH: formatDateH(dateRaw),

      rival: pickRival(game),

      homeKey,
      homeH: homeLabelH(homeKey),
      home: isHome,
      isHome,

      score: pickScore(game, stats, played),
      result,
      resultH: played ? resultLabelH(result) : '',
      points,

      goalsFor,
      goalsAgainst,

      gameDuration,
      timePlayed,
      goals,
      assists,
      isStarting,

      vLink,
      hasVideo,
      videoIcon,
      videoColor,
    }
  }
}
