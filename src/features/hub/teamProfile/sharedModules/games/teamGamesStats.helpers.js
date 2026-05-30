// teamProfile/sharedModules/games/teamGamesStats.helpers.js

export const getGameId = game => {
  return (
    game?.id ||
    game?.gameId ||
    game?.game?.id ||
    game?.game?.gameId ||
    ''
  )
}

export const getGameStatsDocId = game => {
  const source = game?.game || game || {}

  return (
    source?.statsDocId ||
    source?.gameStatsDocId ||
    game?.statsDocId ||
    game?.gameStatsDocId ||
    ''
  )
}

export const getCreatedStatsDocId = ({ result, payload }) => {
  return (
    result?.ids?.gameStatsDocId ||
    result?.gameStatsDocId ||
    payload?.gameStatsDocId ||
    payload?.statsDocId ||
    ''
  )
}

export const mergeStatsDocId = ({ payload, draft, gameStatsDocId }) => {
  return {
    payload: {
      ...(payload || {}),
      ...(gameStatsDocId ? { gameStatsDocId } : {}),
    },
    draft: {
      ...(draft || {}),
      ...(gameStatsDocId ? { gameStatsDocId } : {}),
    },
  }
}

export const isLocalDraftSave = payload => {
  return payload?.status === 'draft'
}
