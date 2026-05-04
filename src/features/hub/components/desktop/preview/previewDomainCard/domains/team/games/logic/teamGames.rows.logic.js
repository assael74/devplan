// preview/previewDomainCard/domains/team/games/logic/teamGames.rows.logic.js

import { getFullDateIl } from '../../../../../../../../../../shared/format/dateUtiles.js'
import {
  GAME_TYPE,
  GAME_DIFFICULTY,
  isGamePlayed,
} from '../../../../../../../../../../shared/games/games.constants.js'
import { createGameRowNormalizer } from '../../../../../../../../../../shared/games/games.normalize.logic.js'
import { buildGamesView } from '../../../../../../../../../../shared/games/games.view.logic.js'

const safe = (v) => (v == null ? '' : String(v))

const pickGame = (row) => row?.game || row || {}
const pickStats = (row) => row?.stats || row || {}

const typeMetaById = Object.fromEntries((GAME_TYPE || []).map((x) => [x.id, x]))
const diffMetaById = Object.fromEntries((GAME_DIFFICULTY || []).map((x) => [x.id, x]))

const normalizeRow = createGameRowNormalizer({
  formatDateH: (dateRaw) => {
    const v = safe(getFullDateIl(dateRaw)).trim()
    return v || '—'
  },

  pick: {
    pickId: (row) => safe(row?.gameId) || safe(row?.game?.id) || safe(row?.id),
    pickGame,
    pickStats,
    pickRival: (game) =>
      safe(game?.rivel || game?.rival || game?.rivalName || game?.opponent).trim() ||
      '—',
  },
})

export const getGameDifficultyLabelH = (difficultyId) => {
  if (!difficultyId) return 'לא הוגדר'

  const meta = GAME_DIFFICULTY.find((x) => x.id === difficultyId)

  return meta?.labelH || 'לא הוגדר'
}

const calcResultByGoals = (goalsFor, goalsAgainst) => {
  if (goalsFor > goalsAgainst) return 'win'
  if (goalsFor < goalsAgainst) return 'loss'
  return 'draw'
}

const calcPointsByResult = (result) => {
  if (result === 'win') return 3
  if (result === 'draw') return 1
  if (result === 'loss') return 0
  return 0
}

export const enrichTeamGameRow = (row) => {
  const game = row?.game || {}
  const typeMeta = typeMetaById[row?.type] || null
  const diffMeta = diffMetaById[row?.difficulty] || null
  const isHome = !!row?.isHome

  const gameStatus = safe(game?.gameStatus || row?.gameStatus || 'scheduled')
  const played = isGamePlayed({ gameStatus })

  const goalsForRaw = game?.goalsFor ?? row?.goalsFor
  const goalsAgainstRaw = game?.goalsAgainst ?? row?.goalsAgainst

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

  const result = played
    ? safe(row?.result).trim() ||
      safe(game?.result).trim() ||
      (hasGoalsFor && hasGoalsAgainst
        ? calcResultByGoals(goalsFor, goalsAgainst)
        : '')
    : ''

  const points = played
    ? Number.isFinite(Number(row?.points))
      ? Number(row.points)
      : Number.isFinite(Number(game?.points))
        ? Number(game.points)
        : calcPointsByResult(result)
    : 0

  return {
    ...row,
    gameStatus,

    goalsFor,
    goalsAgainst,

    score:
      played && hasGoalsFor && hasGoalsAgainst
        ? `${goalsFor} - ${goalsAgainst}`
        : '',

    result,
    points,

    dateLabel: row?.dateH || '—',
    homeLabel: isHome ? 'בית' : 'חוץ',
    typeIcon: typeMeta?.idIcon || '',
    difficultyIcon: diffMeta?.idIcon || '',
    raw: {
      ...game,
      gameStatus,
    },
  }
}

export const buildTeamGamesRowsView = (team) => {
  const baseRows = Array.isArray(team?.teamGames) ? team.teamGames : []

  return buildGamesView(baseRows, (row) => enrichTeamGameRow(normalizeRow(row)))
}
