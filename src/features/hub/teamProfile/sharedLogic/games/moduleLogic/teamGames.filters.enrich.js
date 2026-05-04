// teamProfile/sharedLogic/games/moduleLogic/teamGames.filters.enrich.js

import {
  GAME_TYPE,
  GAME_DIFFICULTY,
  GAME_RESULT,
  GAME_HOME_AWAY,
  resolveGameStatusMeta,
  isGamePlayed,
} from '../../../../../../shared/games/games.constants.js'

const safeArray = (v) => (Array.isArray(v) ? v : [])
const safe = (v) => (v == null ? '' : String(v).trim())

export const findConstItem = (arr, id) => {
  return safeArray(arr).find((item) => item?.id === id) || null
}

export const mapHomeToKey = (home) => {
  if (
    home === true ||
    home === 'true' ||
    home === 1 ||
    home === '1' ||
    home === 'home'
  ) {
    return 'home'
  }

  if (
    home === false ||
    home === 'false' ||
    home === 0 ||
    home === '0' ||
    home === 'away'
  ) {
    return 'away'
  }

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
  const rawGamePlayers = safeArray(
    game?.gamePlayers ||
      game?.game?.gamePlayers ||
      game?.players ||
      game?.game?.players
  )

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

  const gameStatus = safe(game?.gameStatus) || 'scheduled'
  const statusMeta = resolveGameStatusMeta(gameStatus)
  const played = isGamePlayed({ gameStatus })

  const typeMeta = findConstItem(GAME_TYPE, game?.type)
  const difficultyMeta = findConstItem(GAME_DIFFICULTY, game?.difficulty)
  const resultMeta = played ? findConstItem(GAME_RESULT, game?.result) : null

  const homeKey = mapHomeToKey(game?.home ?? game?.homeKey)
  const homeMeta = findConstItem(GAME_HOME_AWAY, homeKey)

  const teamPlayersMap = buildTeamPlayersMap(srcTeam)
  const gamePlayers = enrichGamePlayers(game, teamPlayersMap)
  //console.log(game)

  const hasVideo = !!game?.vLink

  return {
    ...game,

    team: srcTeam,
    teamId: srcTeam?.id || game?.teamId || '',
    teamName: srcTeam?.teamName || srcTeam?.name || game?.teamName || '',
    teamPhoto: srcTeam?.photo || game?.teamPhoto || '',

    gameStatus,
    statusH: statusMeta?.labelH || 'מתוכנן',
    statusIcon: statusMeta?.idIcon || 'calendar',
    statusColor: statusMeta?.color || 'neutral',

    typeH: typeMeta?.labelH || game?.typeH || game?.type || '',
    typeIcon: typeMeta?.idIcon || 'game',

    difficultyH:
      difficultyMeta?.labelH || game?.difficultyH || game?.difficulty || '',
    difficultyIcon: difficultyMeta?.idIcon || 'difficulty',

    result: played ? game?.result || '' : '',
    resultH: played ? resultMeta?.labelH || game?.resultH || game?.result || '' : '',
    resultIcon: played ? resultMeta?.idIcon || 'result' : 'result',

    score: played ? game?.score || '' : '',

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
