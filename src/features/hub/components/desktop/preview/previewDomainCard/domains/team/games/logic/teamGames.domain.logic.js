// preview/previewDomainCard/domains/team/games/logic/teamGames.domain.logic.js

import { DOMAIN_STATE } from '../../../../../preview.state'
import { getFullDateIl } from '../../../../../../../../../../shared/format/dateUtiles.js'
import { GAME_TYPE, GAME_DIFFICULTY } from '../../../../../../../../../../shared/games/games.constants.js'
import { createGameRowNormalizer } from '../../../../../../../../../../shared/games/games.normalize.logic.js'
import { buildGamesView } from '../../../../../../../../../../shared/games/games.view.logic.js'
import { aggSummary, n } from '../../../../../../../../../../shared/games/games.summary.logic.js'

const safe = (v) => (v == null ? '' : String(v))

const pickGame = (row) => row?.game || row || {}
const pickStats = (row) => row?.stats || row || {}

const typeMetaById = Object.fromEntries((GAME_TYPE || []).map((x) => [x.id, x]))
const diffMetaById = Object.fromEntries((GAME_DIFFICULTY || []).map((x) => [x.id, x]))

export function getLeaguePointsSummary(summary) {
  const leaguePoints = summary?.leaguePoints || {}

  return {
    leaguePossible: leaguePoints?.possible ?? 0,
    leagueAchieved: leaguePoints?.achieved ?? 0,
    leagueSuccessPct: leaguePoints?.successPct ?? 0,
  }
}

export const getGameDifficultyLabelH = (difficultyId) => {
  if (!difficultyId) return 'לא הוגדר'

  const meta = GAME_DIFFICULTY.find((x) => x.id === difficultyId)

  return meta?.labelH || 'לא הוגדר'
}

const normalizeRow = createGameRowNormalizer({
  formatDateH: (dateRaw) => {
    const v = safe(getFullDateIl(dateRaw)).trim()
    return v || '—'
  },

  pick: {
    pickId: (row) => safe(row?.gameId) || safe(row?.game?.id) || safe(row?.id),
    pickGame,
    pickStats,
    pickRival: (game) => safe(game?.rivel || game?.rival || game?.rivalName || game?.opponent).trim() || '—',
  },
})

const enrichRow = (row) => {
  const game = row?.game || {}
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

  const result =
    safe(row?.result).trim() ||
    (hasGoalsFor && hasGoalsAgainst
      ? goalsFor > goalsAgainst
        ? 'win'
        : goalsFor < goalsAgainst
        ? 'loss'
        : 'draw'
      : '')

  const points =
    Number.isFinite(Number(row?.points))
      ? Number(row.points)
      : result === 'win'
      ? 3
      : result === 'draw'
      ? 1
      : result === 'loss'
      ? 0
      : 0

  return {
    ...row,
    goalsFor,
    goalsAgainst,
    score:
      hasGoalsFor && hasGoalsAgainst
        ? `${goalsFor} - ${goalsAgainst}`
        : safe(row?.score).trim(),
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
  const leagueRows = (rows || []).filter((x) => x?.type === 'league')
  const playedLeagueRows = leagueRows.filter((x) => {
    const r = safe(x?.result).trim().toLowerCase()
    return r === 'win' || r === 'draw' || r === 'loss'
  })

  const achieved = playedLeagueRows.reduce((sum, x) => sum + n(x?.points), 0)
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

export const resolveTeamGamesDomain = (team) => {
  const baseRows = Array.isArray(team?.teamGames) ? team.teamGames : []

  const built = buildGamesView(baseRows, (row) => enrichRow(normalizeRow(row)))
  const rows = built?.rows || []
  const summary = built?.summary || aggSummary([])
  const nextGame = built?.nextGame || null
  const leaguePoints = calcLeaguePointsSummary(rows)

  return {
    state: rows.length ? DOMAIN_STATE.OK : DOMAIN_STATE.EMPTY,
    rows,
    playedGames: built?.playedGames || [],
    upcomingGames: built?.upcomingGames || [],
    summary: {
      ...summary,
      league: safe(team?.league) || '—',
      position: safe(team?.position) || '—',
      leaguePoints,
      nextGame: nextGame
        ? {
            rival: nextGame.rival || nextGame.rivel || '—',
            dateRaw: nextGame.dateRaw || '',
            dateLabel: nextGame.dateLabel || nextGame.dateH || '—',
            hourRaw: nextGame.hourRaw || '',
            homeLabel: nextGame.homeLabel || '—',
            typeH: nextGame.typeH || '—',
          }
        : null,
    },
  }
}

export const filterTeamGames = (
  rows,
  { typeFilter, homeFilter, resultFilter, diffFilter }
) => {
  const tf = safe(typeFilter).trim().toLowerCase()
  const hf = safe(homeFilter).trim().toLowerCase()
  const rf = safe(resultFilter).trim().toLowerCase()
  const df = safe(diffFilter).trim().toLowerCase()

  return (rows || []).filter((x) => {
    if (tf && tf !== 'all' && x.type !== tf) return false
    if (hf === 'home' && !x.isHome) return false
    if (hf === 'away' && x.isHome) return false
    if (rf && rf !== 'all' && x.result !== rf) return false
    if (df && df !== 'all' && x.difficulty !== df) return false
    return true
  })
}

export const buildTeamGamesFilterCounts = (
  rows,
  { typeFilter, homeFilter, resultFilter, diffFilter }
) => {
  const byTypeBase = filterTeamGames(rows, {
    typeFilter: 'all',
    homeFilter,
    resultFilter,
    diffFilter,
  })

  const byHomeBase = filterTeamGames(rows, {
    typeFilter,
    homeFilter: 'all',
    resultFilter,
    diffFilter,
  })

  const byResultBase = filterTeamGames(rows, {
    typeFilter,
    homeFilter,
    resultFilter: 'all',
    diffFilter,
  })

  const byDiffBase = filterTeamGames(rows, {
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
