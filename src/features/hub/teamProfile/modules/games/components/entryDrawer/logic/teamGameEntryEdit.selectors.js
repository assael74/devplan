import { safe, toNum, getGameSource } from './teamGameEntryEdit.shared.js'

export const getGameDurationLimit = (draft) => {
  return toNum(draft?.raw?.gameDuration ?? 0)
}

export const getTeamGoalsLimit = (draft) => {
  return toNum(draft?.raw?.goalsFor ?? 0)
}

export const getGoalsTotal = (rows = []) => {
  return rows.reduce((sum, row) => sum + toNum(row?.goals), 0)
}

export const getAssistsTotal = (rows = []) => {
  return rows.reduce((sum, row) => sum + toNum(row?.assists), 0)
}

export const getOnStartTotal = (rows = []) => {
  return rows.filter((row) => row?.onStart === true).length
}

export const getGamePlayers = (game) => {
  const source = getGameSource(game)
  return Array.isArray(source?.gamePlayers) ? source.gamePlayers : []
}

export const getTeamPlayers = (team, context) => {
  const direct = team?.players || team?.teamPlayers || team?.squad || []

  if (Array.isArray(direct) && direct.length) return direct

  const allPlayers = Array.isArray(context?.players) ? context.players : []

  return allPlayers.filter((p) => {
    const pTeamId =
      p?.teamId ||
      p?.team?.id ||
      p?.currentTeamId ||
      ''

    return team?.id && pTeamId === team.id
  })
}

export const isGamePlayed = (game) => {
  const source = getGameSource(game)

  if (typeof source?.isPlayed === 'boolean') return source.isPlayed
  if (typeof source?.played === 'boolean') return source.played
  if (typeof source?.wasPlayed === 'boolean') return source.wasPlayed
  if (safe(source?.status).trim().toLowerCase() === 'played') return true
  if (safe(source?.status).trim().toLowerCase() === 'scheduled') return false

  const hasResult =
    source?.goalsFor != null ||
    source?.goalsAgainst != null ||
    safe(source?.result).trim()

  return !!hasResult
}
