import {
  safeArr,
  safeId,
  safeStr,
  toMillis,
  getWeekStartFromDate,
  getWeekEndFromStart,
  buildWeekIdFromStart
} from '../../utils/data.utils.js'
import { uniqBy } from '../../utils/map.utils.js'

export const normalizeGame = (game = {}) => {
  const eventDate = toMillis(game?.gameDate || game?.date)
  const weekStart = getWeekStartFromDate(eventDate)

  const teamId =
    safeId(game?.teamId) ||
    safeId(game?.team?.id) ||
    safeId(game?.team?.teamId)

  return {
    ...game,
    id: safeId(game?.id),
    teamId,
    weekId: safeStr(game?.weekId) || buildWeekIdFromStart(weekStart),
    weekStart,
    weekEnd: getWeekEndFromStart(weekStart),
    eventDate,
    eventSortTime: eventDate,
  }
}

export const buildGamesByTeamId = (gamesArr)=>{
  const map = new Map()

  for(const raw of safeArr(gamesArr)){
    const g = normalizeGame(raw)
    const tid = safeId(g.teamId)
    if(!tid) continue
    if(!map.has(tid)) map.set(tid,[])
    map.get(tid).push(g)
  }

  for(const [k,arr] of map.entries()){
    map.set(k,uniqBy(arr,x=>x.id))
  }

  return map
}

export function buildPlayerGames(teamGames, playerId) {
  return (teamGames || []).reduce((acc, game) => {
    const players = Array.isArray(game?.players) && game.players.length
      ? game.players
      : Array.isArray(game?.gamePlayers)
        ? game.gamePlayers
        : []

    const playerGame = players.find((p) => String(p?.playerId || p?.id) === String(playerId))
    if (!playerGame) return acc

    acc.push({
      ...game,
      playerGame,
    })

    return acc
  }, [])
}
