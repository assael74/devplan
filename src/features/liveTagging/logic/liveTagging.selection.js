// src/features/liveTagging/logic/liveTagging.selection.js

export const LIVE_SUBJECT_TYPES = {
  PLAYER: 'player',
  TEAM: 'team',
}

const clean = (value) => String(value ?? '').trim()

const sameId = (a, b) => clean(a) === clean(b)

const getId = (item) => clean(item?.id || item?.uid || item?.value)

export const buildInitialSelection = ({
  subjectType = LIVE_SUBJECT_TYPES.PLAYER,
  playerId = '',
  teamId = '',
  gameId = '',
} = {}) => ({
  subjectType,
  playerId,
  teamId,
  gameId,
})

export const isPlayerSelection = (selection) => {
  return selection?.subjectType === LIVE_SUBJECT_TYPES.PLAYER
}

export const isTeamSelection = (selection) => {
  return selection?.subjectType === LIVE_SUBJECT_TYPES.TEAM
}

export const setSelectionSubjectType = (selection, subjectType) => ({
  ...selection,
  subjectType: subjectType || LIVE_SUBJECT_TYPES.PLAYER,
  playerId: '',
  teamId: '',
  gameId: '',
})

export const setSelectionPlayerId = (selection, playerId) => ({
  ...selection,
  playerId: clean(playerId),
  teamId: '',
  gameId: '',
})

export const setSelectionTeamId = (selection, teamId) => ({
  ...selection,
  teamId: clean(teamId),
  playerId: '',
  gameId: '',
})

export const setSelectionGameId = (selection, gameId) => ({
  ...selection,
  gameId: clean(gameId),
})

export const getSelectedPlayer = (players = [], playerId = '') => {
  return players.find((item) => sameId(getId(item), playerId)) || null
}

export const getSelectedTeam = (teams = [], teamId = '') => {
  return teams.find((item) => sameId(getId(item), teamId)) || null
}

export const getSelectedGame = (games = [], gameId = '') => {
  return games.find((item) => sameId(getId(item), gameId)) || null
}

export const getPlayerTeamId = (player) => {
  return clean(
    player?.teamId ||
    player?.team?.id ||
    player?.currentTeamId ||
    player?.relations?.teamId
  )
}

export const getGameTeamId = (game) => {
  return clean(
    game?.teamId ||
    game?.team?.id ||
    game?.homeTeamId ||
    game?.clubTeamId
  )
}

export const resolveSelectionTeamId = ({ selection, players = [] }) => {
  if (!selection) return ''

  if (isTeamSelection(selection)) {
    return clean(selection.teamId)
  }

  const player = getSelectedPlayer(players, selection.playerId)
  return getPlayerTeamId(player)
}

export const hasSelectedSubject = ({ selection, players = [] }) => {
  if (!selection?.subjectType) return false

  if (isPlayerSelection(selection)) {
    return Boolean(selection.playerId && resolveSelectionTeamId({ selection, players }))
  }

  return Boolean(selection.teamId)
}

export const filterGamesBySelection = ({
  games = [],
  selection,
  players = [],
}) => {
  const teamId = resolveSelectionTeamId({ selection, players })
  if (!teamId) return []

  return games.filter((game) => {
    return sameId(getGameTeamId(game), teamId)
  })
}

export const canUseLiveTagging = (selection) => {
  if (!selection?.subjectType) return false
  if (!selection?.gameId) return false

  if (isPlayerSelection(selection)) {
    return Boolean(selection.playerId)
  }

  return Boolean(selection.teamId)
}

export const buildSelectionLabel = ({
  selection,
  players = [],
  teams = [],
  games = [],
}) => {
  const player = getSelectedPlayer(players, selection?.playerId)
  const teamId = resolveSelectionTeamId({ selection, players })
  const team = getSelectedTeam(teams, teamId)
  const game = getSelectedGame(games, selection?.gameId)

  const isPlayer = isPlayerSelection(selection)
  const subject = isPlayer ? player : team

  return {
    ready: canUseLiveTagging(selection),
    typeLabel: isPlayer ? 'שחקן' : 'קבוצה',
    subjectLabel: subject?.name || subject?.label || 'לא נבחר',
    teamLabel: team?.name || team?.label || '',
    gameLabel:
      game?.name ||
      game?.label ||
      game?.rival ||
      game?.rivel ||
      'לא נבחר משחק',
  }
}
