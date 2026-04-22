// teamProfile/sharedLogic/games/entryLogic/teamGameEntryEdit.draft.js

import {
  buildDrawerMeta,
  getPlayerDisplayName,
  toNumOrEmpty,
} from './teamGameEntryEdit.shared.js'

import {
  getGamePlayers,
  getTeamPlayers,
  isGamePlayed,
} from './teamGameEntryEdit.selectors.js'

export const buildRowFromPlayer = (player, existing) => {
  const playerId = player?.id || existing?.playerId || ''
  const current = existing || {}

  return {
    id: playerId,
    playerId,
    playerName: getPlayerDisplayName(player),
    playerNumber: player?.number || player?.shirtNumber || player?.playerNumber || '',
    position: player?.position || player?.mainPosition || '',
    avatar: player?.img || player?.avatar || player?.photo || '',
    rawPlayer: player,

    onSquad: current?.onSquad === true,
    onStart: current?.onStart === true,
    goals: toNumOrEmpty(current?.goals),
    assists: toNumOrEmpty(current?.assists),
    timePlayed: toNumOrEmpty(current?.timePlayed),

    initial: {
      onSquad: current?.onSquad === true,
      onStart: current?.onStart === true,
      goals: toNumOrEmpty(current?.goals),
      assists: toNumOrEmpty(current?.assists),
      timePlayed: toNumOrEmpty(current?.timePlayed),
    },
  }
}

export const buildInitialDraft = (game, team, context) => {
  const meta = buildDrawerMeta(game)
  const existingGamePlayers = getGamePlayers(game)
  const squad = getTeamPlayers(team, context)

  const existingMap = new Map(
    existingGamePlayers
      .filter(Boolean)
      .map((item) => [item?.playerId || item?.id, item])
      .filter(([id]) => !!id)
  )

  const activeSquad = squad.filter((player) => player?.active !== false)

  const rosterRows = activeSquad.map((player) => {
    const key = player?.id
    return buildRowFromPlayer(player, existingMap.get(key))
  })

  const extraExistingRows = existingGamePlayers
    .filter((item) => item?.playerId && !rosterRows.some((row) => row.playerId === item.playerId))
    .map((item) =>
      buildRowFromPlayer(
        {
          id: item?.playerId,
          name: item?.playerName || item?.name || 'שחקן',
          number: item?.playerNumber || '',
          position: item?.position || '',
          avatar: item?.avatar || '',
        },
        item
      )
    )

  return {
    ...meta,
    isPlayed: isGamePlayed(game),
    rows: [...rosterRows, ...extraExistingRows],
    existingGamePlayers,
  }
}
