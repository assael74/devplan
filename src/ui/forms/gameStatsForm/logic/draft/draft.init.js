// src/ui/forms/gameStatsForm/logic/draft/draft.init.js

import {
  buildGameStatsPlayers,
  createPlayerStatsRows,
  getDefaultSelectedPlayerIds,
} from '../players.logic.js'

import {
  resolvePresetParmIds,
} from '../parms.logic.js'

export const createInitialGameStatsDraft = ({ game, team }) => {
  const players = buildGameStatsPlayers(game)
  const selectedPlayerIds = getDefaultSelectedPlayerIds(players)
  const selectedParmIds = resolvePresetParmIds('basic')
  const gameDuration = game?.gameDuration || 80

  return {
    gameId: game?.id || '',
    teamId: team?.id || game?.teamId || '',
    gameStatsDocId: game?.statsDocId || '',
    status: game?.statsStatus || 'draft',
    source: 'manual',
    preset: 'basic',

    players,
    selectedPlayerIds,
    selectedParmIds,
    activePlayerId: selectedPlayerIds[0] || '',

    playerStats: createPlayerStatsRows({
      players,
      selectedPlayerIds,
      game,
      team,
    }),

    teamStats: {},
    timePlayed: gameDuration,
    timeVideoStats: gameDuration,
  }
}
