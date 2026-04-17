import { GAME_TYPE, GAME_DIFFICULTY } from '../../../../../../shared/games/games.constants.js'
import { GAME_RESULT, GAME_HOME_AWAY } from './teamGames.filters.constants.js'

const safeArray = (v) => (Array.isArray(v) ? v : [])

export const findConstItem = (arr, id) => {
  return safeArray(arr).find((item) => item?.id === id) || null
}

export const mapHomeToKey = (home) => {
  if (home === true || home === 'true' || home === 1 || home === '1' || home === 'home') return 'home'
  if (home === false || home === 'false' || home === 0 || home === '0' || home === 'away') return 'away'
  return ''
}

export const buildTeamPlayersMap = (team) => {
  const teamPlayers = safeArray(team?.players)

  return new Map(
    teamPlayers.map((player) => [
      player?.id || player?.playerId,
      player,
    ])
  )
}

export const enrichGamePlayers = (game, teamPlayersMap) => {
  const rawGamePlayers = safeArray(game?.game?.gamePlayers)

  return rawGamePlayers.map((item) => {
    const playerId = item?.playerId || item?.id || ''
    const player = teamPlayersMap.get(playerId) || {}

    return {
      ...item,
      playerId,
      photo: player?.photo || '',
      playerFullName: player?.playerFullName || '',
      isKey: player?.isKey || false,
      type: player?.type || item?.type || '',
    }
  })
}

export const enrichGameWithTeam = (game, team) => {
  const srcTeam = team || {}

  const typeMeta = findConstItem(GAME_TYPE, game?.type)
  const difficultyMeta = findConstItem(GAME_DIFFICULTY, game?.difficulty)
  const resultMeta = findConstItem(GAME_RESULT, game?.result)

  const homeKey = mapHomeToKey(game?.home)
  const homeMeta = findConstItem(GAME_HOME_AWAY, homeKey)

  const teamPlayersMap = buildTeamPlayersMap(srcTeam)
  const gamePlayers = enrichGamePlayers(game, teamPlayersMap)

  const hasVideo = !!game?.vLink

  return {
    ...game,
    team: srcTeam,
    teamId: srcTeam?.id || '',
    teamName: srcTeam?.teamName || srcTeam?.name || '',
    teamPhoto: srcTeam?.photo || '',

    typeH: typeMeta?.labelH || game?.typeH || game?.type || '',
    typeIcon: typeMeta?.idIcon || 'game',

    difficultyH: difficultyMeta?.labelH || game?.difficultyH || game?.difficulty || '',
    difficultyIcon: difficultyMeta?.idIcon || 'difficulty',

    resultH: resultMeta?.labelH || game?.resultH || game?.result || '',
    resultIcon: resultMeta?.idIcon || 'result',

    homeKey,
    homeH: homeMeta?.labelH || '',
    homeIcon: homeMeta?.idIcon || 'home',

    vLink: game?.vLink || '',
    videoIcon: hasVideo ? 'video' : 'noVideo',
    videoColor: hasVideo ? '#3cfa06' : '#fa1606',
    hasVideo,

    gamePlayers,
  }
}
