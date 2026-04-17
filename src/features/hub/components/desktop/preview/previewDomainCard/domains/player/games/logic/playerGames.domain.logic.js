// preview/previewDomainCard/domains/player/games/logic/playerGames.domain.logic.js

import { DOMAIN_STATE } from '../../../../../preview.state'
import { getFullDateIl } from '../../../../../../../../../../shared/format/dateUtiles.js'
import { GAME_TYPE, GAME_DIFFICULTY } from '../../../../../../../../../../shared/games/games.constants.js'
import { createGameRowNormalizer } from '../../../../../../../../../../shared/games/games.normalize.logic.js'
import { buildGamesView } from '../../../../../../../../../../shared/games/games.view.logic.js'
import { aggSummary, n } from '../../../../../../../../../../shared/games/games.summary.logic.js'
import { calcPlayerParticipationSummary } from '../../../../../../../../../../shared/games/games.player.logic.js'

const safe = (v) => (v == null ? '' : String(v))

const pickGame = (row) => row?.game || row || {}
const pickStats = (row) => row?.stats || row || {}

const typeMetaById = Object.fromEntries((GAME_TYPE || []).map((item) => [item.id, item]))
const diffMetaById = Object.fromEntries((GAME_DIFFICULTY || []).map((item) => [item.id, item]))

const normalizeRow = createGameRowNormalizer({
  formatDateH: (dateRaw) => {
    const value = safe(getFullDateIl(dateRaw)).trim()
    return value || '—'
  },
  pick: {
    pickId: (row) => safe(row?.gameId) || safe(row?.game?.id) || safe(row?.id),
    pickGame,
    pickStats,
    pickRival: (game) => safe(game?.rivel || game?.rival || game?.rivalName || game?.opponent).trim() || '—',
  },
})

const getResolvedResult = ({ row, game }) => {
  const rawResult = safe(row?.result).trim()
  if (rawResult) return rawResult

  const goalsForRaw = game?.goalsFor
  const goalsAgainstRaw = game?.goalsAgainst

  const hasGoalsFor =
    goalsForRaw !== '' &&
    goalsForRaw != null &&
    Number.isFinite(Number(goalsForRaw))

  const hasGoalsAgainst =
    goalsAgainstRaw !== '' &&
    goalsAgainstRaw != null &&
    Number.isFinite(Number(goalsAgainstRaw))

  if (!hasGoalsFor || !hasGoalsAgainst) return ''

  const goalsFor = Number(goalsForRaw)
  const goalsAgainst = Number(goalsAgainstRaw)

  if (goalsFor > goalsAgainst) return 'win'
  if (goalsFor < goalsAgainst) return 'loss'
  return 'draw'
}

const getResolvedPoints = ({ row, result }) => {
  const rawPoints = Number(row?.points)
  if (Number.isFinite(rawPoints)) return rawPoints

  if (result === 'win') return 3
  if (result === 'draw') return 1
  if (result === 'loss') return 0
  return 0
}

const enrichRow = (row) => {
  const game = row?.game || {}
  const stats = row?.stats || {}

  const timePlayed = Number(stats?.timePlayed) || 0
  const goals = Number(stats?.goals) || 0
  const assists = Number(stats?.assists) || 0
  const isSelected = stats?.isSelected === true
  const isStarting = stats?.isStarting === true

  const typeMeta = typeMetaById[row?.type] || null
  const diffMeta = diffMetaById[row?.difficulty] || null
  const isHome = !!row?.isHome

  const goalsForRaw = game?.goalsFor
  const goalsAgainstRaw = game?.goalsAgainst

  const hasGoalsFor =
    goalsForRaw !== '' &&
    goalsForRaw != null &&
    Number.isFinite(Number(goalsForRaw))

  const hasGoalsAgainst =
    goalsAgainstRaw !== '' &&
    goalsAgainstRaw != null &&
    Number.isFinite(Number(goalsAgainstRaw))

  const goalsFor = hasGoalsFor ? Number(goalsForRaw) : ''
  const goalsAgainst = hasGoalsAgainst ? Number(goalsAgainstRaw) : ''
  const result = getResolvedResult({ row, game })
  const points = getResolvedPoints({ row, result })

  return {
    ...row,
    goalsFor,
    goalsAgainst,
    timePlayed,
    goals,
    assists,
    isSelected,
    isStarting,
    score: hasGoalsFor && hasGoalsAgainst ? `${goalsFor} - ${goalsAgainst}` : safe(row?.score).trim(),
    result,
    points,
    dateLabel: row?.dateH || '—',
    homeLabel: isHome ? 'בית' : 'חוץ',
    typeIcon: typeMeta?.idIcon || '',
    difficultyIcon: diffMeta?.idIcon || '',
    raw: game,
  }
}

const countBy = (rows, getKey) => {
  return (rows || []).reduce((acc, row) => {
    const key = safe(getKey(row)).trim().toLowerCase()
    if (!key) return acc
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
}

const calcLeaguePointsSummary = (rows) => {
  const leagueRows = (rows || []).filter((row) => row?.type === 'league')

  const playedLeagueRows = leagueRows.filter((row) => {
    const result = safe(row?.result).trim().toLowerCase()
    return result === 'win' || result === 'draw' || result === 'loss'
  })

  const achieved = playedLeagueRows.reduce((sum, row) => sum + n(row?.points), 0)
  const possible = playedLeagueRows.length * 3
  const successPct = possible > 0 ? Math.round((achieved / possible) * 100) : 0

  return {
    totalGames: leagueRows.length,
    playedGames: playedLeagueRows.length,
    achieved,
    possible,
    successPct,
  }
}

const buildNextGameSummary = (nextGame) => {
  if (!nextGame) return null

  return {
    rival: nextGame.rival || nextGame.rivel || '—',
    dateRaw: nextGame.dateRaw || '',
    dateLabel: nextGame.dateLabel || nextGame.dateH || '—',
    hourRaw: nextGame.hourRaw || '',
    homeLabel: nextGame.homeLabel || '—',
    typeH: nextGame.typeH || '—',
  }
}

export const resolvePlayerGamesDomain = (player) => {
  const baseRows = Array.isArray(player?.playerGames) ? player.playerGames : []
  const built = buildGamesView(baseRows, (row) => enrichRow(normalizeRow(row)))
  const rows = built?.rows || []

  const participation = calcPlayerParticipationSummary({ player, rows })
  const leaguePoints = calcLeaguePointsSummary(rows)

  return {
    state: rows.length ? DOMAIN_STATE.OK : DOMAIN_STATE.EMPTY,
    rows,
    playedGames: built?.playedGames || [],
    upcomingGames: built?.upcomingGames || [],
    summary: {
      ...(built?.summary || aggSummary([])),
      ...participation,
      league: safe(player?.team?.league) || '—',
      position: safe(player?.team?.position) || '—',
      leaguePoints,
      nextGame: buildNextGameSummary(built?.nextGame),
    },
  }
}

export const filterPlayerGames = (
  rows,
  { typeFilter, homeFilter, resultFilter, diffFilter }
) => {
  const tf = safe(typeFilter).trim().toLowerCase()
  const hf = safe(homeFilter).trim().toLowerCase()
  const rf = safe(resultFilter).trim().toLowerCase()
  const df = safe(diffFilter).trim().toLowerCase()

  return (rows || []).filter((row) => {
    if (tf && tf !== 'all' && row.type !== tf) return false
    if (hf === 'home' && !row.isHome) return false
    if (hf === 'away' && row.isHome) return false
    if (rf && rf !== 'all' && row.result !== rf) return false
    if (df && df !== 'all' && row.difficulty !== df) return false
    return true
  })
}

export const buildPlayerGamesFilterCounts = (
  rows,
  { typeFilter, homeFilter, resultFilter, diffFilter }
) => {
  const byTypeBase = filterPlayerGames(rows, {
    typeFilter: 'all',
    homeFilter,
    resultFilter,
    diffFilter,
  })

  const byHomeBase = filterPlayerGames(rows, {
    typeFilter,
    homeFilter: 'all',
    resultFilter,
    diffFilter,
  })

  const byResultBase = filterPlayerGames(rows, {
    typeFilter,
    homeFilter,
    resultFilter: 'all',
    diffFilter,
  })

  const byDiffBase = filterPlayerGames(rows, {
    typeFilter,
    homeFilter,
    resultFilter,
    diffFilter: 'all',
  })

  const typeCounts = countBy(byTypeBase, (row) => row?.type)
  const resultCounts = countBy(byResultBase, (row) => row?.result)
  const diffCounts = countBy(byDiffBase, (row) => row?.difficulty)

  const homeCounts = {
    home: byHomeBase.filter((row) => row?.isHome).length,
    away: byHomeBase.filter((row) => !row?.isHome).length,
  }

  return {
    type: {
      all: byTypeBase.length,
      ...typeCounts,
    },
    home: {
      all: byHomeBase.length,
      ...homeCounts,
    },
    result: {
      all: byResultBase.length,
      ...resultCounts,
    },
    diff: {
      all: byDiffBase.length,
      ...diffCounts,
    },
  }
}
