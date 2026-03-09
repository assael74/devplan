// teamProfile/modules/games/teamGames.logic.js
import { getFullDateIl } from '../../../../../shared/format/dateUtiles.js'
import { safe, normalizeDate, normalizeTime } from '../../../../../shared/games/games.time.logic.js'

import { createGameRowNormalizer } from '../../../../../shared/games/games.normalize.logic.js'
import { buildGamesView } from '../../../../../shared/games/games.view.logic.js'
import { scoreFromGameAndStats } from '../../../../../shared/games/games.score.logic.js'
import { buildHaystack } from '../../../../../shared/games/games.search.logic.js'

export { DOMAIN_STATE } from '../../../../../shared/games/games.view.logic.js'

// ---------- Team Adapter (extractors) ----------
const pickGame = (row) => row?.game || {}
const pickStats = (row) => row?.stats || row?.gameStats?.stats || row?.gameStats || {}

const pickId = (row) => safe(row?.gameId) || safe(row?.game?.id) || safe(row?.id)
const pickType = (game) => safe(game?.type).toLowerCase().trim() || 'friendly'
const pickDifficulty = (game) => safe(game?.difficulty).toLowerCase().trim()
const pickDateRaw = (game) => normalizeDate(game?.gameDate)
const pickHourRaw = (game) => normalizeTime(game?.gameHour)
const pickRival = (game) => safe(game?.rivel || game?.rivalName || game?.opponent).trim() || '—'
const pickIsHome = (game) => !!game?.home
const pickResult = (game) => safe(game?.result).trim()
const pickPoints = (stats, game) => Number(stats?.points ?? game?.points) || 0
const pickScore = (game, stats) => scoreFromGameAndStats({ game, stats })

const normalizeRow = createGameRowNormalizer({
  pick: {
    pickId,
    pickGame,
    pickStats,
    pickType,
    pickDifficulty,
    pickDateRaw,
    pickHourRaw,
    pickRival,
    pickIsHome,
    pickResult,
    pickPoints,
    pickScore,
  },
  formatDateH: (dateRaw) => getFullDateIl(dateRaw),
})

export const buildPlayerGamesView = (player) => {
  const base = Array.isArray(player?.playerGames) ? player.playerGames : []
  return buildGamesView(base, normalizeRow)
}

export const resolvePlayerGames = (player) => buildPlayerGamesView(player)

// פילטרים (כמו שיש לך כבר)
export const filterPlayerGames = (rows, { q, typeFilter, homeFilter, resultFilter }) => {
  const search = safe(q).trim().toLowerCase()
  const tf = safe(typeFilter).toLowerCase().trim()
  const hf = safe(homeFilter).toLowerCase().trim()
  const rf = safe(resultFilter).toLowerCase().trim()

  return (rows || []).filter((x) => {
    if (tf && tf !== 'all' && x.type !== tf) return false
    if (hf === 'home' && !x.isHome) return false
    if (hf === 'away' && x.isHome) return false

    const rr = safe(x.result).toLowerCase()
    if (rf && rf !== 'all') {
      if (rf === 'unknown' && rr) return false
      if (rf !== 'unknown' && rr !== rf) return false
    }

    if (!search) return true
    return buildHaystack(x).includes(search)
  })
}
