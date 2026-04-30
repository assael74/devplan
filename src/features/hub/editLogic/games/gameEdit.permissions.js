// features/hub/editLogic/games/gameEdit.permissions.js

const clean = (value) => String(value ?? '').trim().toLowerCase()

const isPrivateEntity = (value = {}) => {
  return (
    value?.private === true ||
    value?.isPrivate === true ||
    value?.isPrivatePlayer === true ||
    value?.privatePlayer === true ||
    value?.playerPrivate === true ||
    value?.visibility === 'private' ||
    value?.scope === 'private' ||
    value?.privacy === 'private'
  )
}

export const canEditGameFromContext = ({
  source,
  game,
  player,
  team,
  context,
} = {}) => {
  const normalizedSource = clean(source)

  const fromTeam =
    normalizedSource === 'team' ||
    normalizedSource === 'teamprofile' ||
    normalizedSource === 'team_profile' ||
    normalizedSource === 'team_games'

  if (fromTeam) return true

  const fromPlayer =
    normalizedSource === 'player' ||
    normalizedSource === 'playerprofile' ||
    normalizedSource === 'player_profile' ||
    normalizedSource === 'player_games'

  if (fromPlayer) {
    return (
      isPrivateEntity(player) ||
      isPrivateEntity(context?.player) ||
      isPrivateEntity(game) ||
      isPrivateEntity(context?.game)
    )
  }

  return Boolean(team || context?.team)
}
