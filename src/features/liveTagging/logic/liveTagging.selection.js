// src/features/liveTagging/logic/liveTagging.selection.js

export const LIVE_SUBJECT_TYPES = {
  PLAYER: 'player',
  PRIVATE_PLAYER: 'privatePlayer',
  SCOUT_PLAYER: 'scoutPlayer',
  TEAM: 'team',
}

export const LIVE_SUBJECT_OPTIONS = [
  {
    id: LIVE_SUBJECT_TYPES.PLAYER,
    label: 'שחקן',
    disabled: false,
    idIcon: 'player'
  },
  {
    id: LIVE_SUBJECT_TYPES.PRIVATE_PLAYER,
    label: 'שחקן פרטי',
    disabled: false,
    idIcon: 'private'
  },
  {
    id: LIVE_SUBJECT_TYPES.SCOUT_PLAYER,
    label: 'שחקן במעקב',
    disabled: true,
    idIcon: 'scouting'
  },
  {
    id: LIVE_SUBJECT_TYPES.TEAM,
    label: 'קבוצה',
    disabled: false,
    idIcon: 'team'
  },
]

const clean = value => String(value ?? '').trim()

const sameId = (a, b) => clean(a) === clean(b)

const getId = item => clean(item?.id || item?.uid || item?.value)

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

export const isPlayerSelection = selection => {
  return selection?.subjectType === LIVE_SUBJECT_TYPES.PLAYER
}

export const isPrivatePlayerSelection = selection => {
  return selection?.subjectType === LIVE_SUBJECT_TYPES.PRIVATE_PLAYER
}

export const isScoutPlayerSelection = selection => {
  return selection?.subjectType === LIVE_SUBJECT_TYPES.SCOUT_PLAYER
}

export const isTeamSelection = selection => {
  return selection?.subjectType === LIVE_SUBJECT_TYPES.TEAM
}

export const isAnyPlayerSelection = selection => {
  return (
    isPlayerSelection(selection) ||
    isPrivatePlayerSelection(selection) ||
    isScoutPlayerSelection(selection)
  )
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
  return players.find(item => sameId(getId(item), playerId)) || null
}

export const getSelectedTeam = (teams = [], teamId = '') => {
  return teams.find(item => sameId(getId(item), teamId)) || null
}

export const getSelectedGame = (games = [], gameId = '') => {
  return games.find(item => sameId(getId(item), gameId)) || null
}

export const getPlayerTeamId = player => {
  return clean(
    player?.teamId ||
      player?.team?.id ||
      player?.currentTeamId ||
      player?.relations?.teamId
  )
}

export const isPrivatePlayer = player => {
  if (!player) return false

  return Boolean(
    player.isPrivate ||
      player.isPrivatePlayer ||
      player.isPersonalPlayer ||
      player.playerType === 'private' ||
      player.playerType === 'privatePlayer' ||
      player.source === 'privatePlayer' ||
      player.sourceType === 'privatePlayer' ||
      player.profileType === 'privatePlayer' ||
      (!getPlayerTeamId(player) && player.privatePlayerId)
  )
}

export const isScoutPlayer = player => {
  if (!player) return false

  return Boolean(
    player.isScoutPlayer ||
      player.playerType === 'scoutPlayer' ||
      player.source === 'scoutPlayer' ||
      player.sourceType === 'scoutPlayer' ||
      player.profileType === 'scoutPlayer'
  )
}

export const isRegularPlayer = player => {
  return Boolean(player && !isPrivatePlayer(player) && !isScoutPlayer(player))
}

export const isExternalGame = game => {
  if (!game) return false

  return Boolean(
    game.isExternalGame ||
      game.gameSource === 'external' ||
      game.source === 'external' ||
      game.type === 'external'
  )
}

export const hasGameStatsPointer = game => {
  return Boolean(
    game?.hasStats ||
      game?.statsDocId ||
      game?.gameStatsDocId
  )
}

export const getGameTeamId = game => {
  return clean(
    game?.teamId ||
      game?.team?.id ||
      game?.homeTeamId ||
      game?.clubTeamId
  )
}

const getGamePlayerId = game => {
  return clean(
    game?.playerId ||
      game?.privatePlayerId ||
      game?.player?.id ||
      game?.player?.playerId
  )
}

export const resolveSelectionTeamId = ({ selection, players = [] }) => {
  if (!selection) return ''

  if (isTeamSelection(selection)) {
    return clean(selection.teamId)
  }

  if (isPrivatePlayerSelection(selection) || isScoutPlayerSelection(selection)) {
    return ''
  }

  const player = getSelectedPlayer(players, selection.playerId)

  return getPlayerTeamId(player)
}

export const getPlayersBySubjectType = ({ players = [], subjectType }) => {
  if (subjectType === LIVE_SUBJECT_TYPES.PRIVATE_PLAYER) {
    return players.filter(isPrivatePlayer)
  }

  if (subjectType === LIVE_SUBJECT_TYPES.SCOUT_PLAYER) {
    return players.filter(isScoutPlayer)
  }

  if (subjectType === LIVE_SUBJECT_TYPES.PLAYER) {
    return players.filter(isRegularPlayer)
  }

  return players
}

export const hasSelectedSubject = ({ selection, players = [] }) => {
  if (!selection?.subjectType) return false

  if (isScoutPlayerSelection(selection)) return false

  if (isPrivatePlayerSelection(selection)) {
    const player = getSelectedPlayer(players, selection.playerId)

    return Boolean(player && isPrivatePlayer(player))
  }

  if (isPlayerSelection(selection)) {
    const player = getSelectedPlayer(players, selection.playerId)
    if (!player || !isRegularPlayer(player)) return false

    return Boolean(resolveSelectionTeamId({ selection, players }))
  }

  return Boolean(selection.teamId)
}

const filterPrivatePlayerGames = ({ games, selection }) => {
  return games.filter(game => {
    return (
      isExternalGame(game) &&
      sameId(getGamePlayerId(game), selection.playerId)
    )
  })
}

const filterTeamGames = ({ games, teamId }) => {
  return games.filter(game => {
    return sameId(getGameTeamId(game), teamId)
  })
}

export const filterGamesBySelection = ({ games = [], selection, players = [] }) => {
  if (!selection) return []

  if (isPrivatePlayerSelection(selection)) {
    return filterPrivatePlayerGames({ games, selection })
  }

  if (isScoutPlayerSelection(selection)) {
    return []
  }

  const teamId = resolveSelectionTeamId({ selection, players })
  if (!teamId) return []

  return filterTeamGames({ games, teamId })
}

export const canUseLiveTagging = (selection, players = []) => {
  if (!selection?.subjectType) return false
  if (!selection?.gameId) return false
  if (isScoutPlayerSelection(selection)) return false

  return hasSelectedSubject({ selection, players })
}

export const buildSelectionLabel = ({ selection, players = [], teams = [], games = [] }) => {
  const player = getSelectedPlayer(players, selection?.playerId)
  const teamId = resolveSelectionTeamId({ selection, players })
  const team = getSelectedTeam(teams, teamId)
  const game = getSelectedGame(games, selection?.gameId)

  const isTeam = isTeamSelection(selection)
  const subject = isTeam ? team : player

  const option = LIVE_SUBJECT_OPTIONS.find(item => {
    return item.id === selection?.subjectType
  })

  return {
    ready: canUseLiveTagging(selection, players),
    typeLabel: option?.label || 'בחירה',
    subjectLabel: subject?.name || subject?.label || 'לא נבחר',
    teamLabel: isTeam || isPrivatePlayerSelection(selection)
      ? ''
      : team?.name || team?.label || '',
    gameLabel:
      game?.name ||
      game?.label ||
      game?.rival ||
      game?.rivel ||
      game?.teamName ||
      'לא נבחר משחק',
  }
}
