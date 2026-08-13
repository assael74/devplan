// src/shared/scouting/players/trajectory/playerTransferTrajectory.js

import {
  PLAYER_TRANSFER_DIRECTION,
} from './playerTrajectory.model.js'

import {
  compareOptionalLevel,
} from './playerTrajectory.utils.js'

const hasClubChanged = (previous, current) => {
  if (!previous?.clubId || !current?.clubId) return false
  return previous.clubId !== current.clubId
}

const resolveTransferDirection = ({ clubChange, leagueChange }) => {
  if (clubChange > 0 && leagueChange >= 0) return PLAYER_TRANSFER_DIRECTION.UP
  if (leagueChange > 0 && clubChange >= 0) return PLAYER_TRANSFER_DIRECTION.UP
  if (clubChange < 0 && leagueChange <= 0) return PLAYER_TRANSFER_DIRECTION.DOWN
  if (leagueChange < 0 && clubChange <= 0) return PLAYER_TRANSFER_DIRECTION.DOWN

  if (
    (clubChange > 0 && leagueChange < 0) ||
    (clubChange < 0 && leagueChange > 0)
  ) {
    return PLAYER_TRANSFER_DIRECTION.MIXED
  }

  if (clubChange === 0 && leagueChange === 0) {
    return PLAYER_TRANSFER_DIRECTION.LATERAL
  }

  return PLAYER_TRANSFER_DIRECTION.UNKNOWN
}

export const buildPlayerTransferEvents = (stints = []) => {
  const events = []

  for (let index = 1; index < stints.length; index += 1) {
    const previous = stints[index - 1]
    const current = stints[index]

    if (!hasClubChanged(previous, current)) continue

    const clubChange = compareOptionalLevel(
      previous.clubStrengthLevel || previous.clubLevel,
      current.clubStrengthLevel || current.clubLevel
    )
    const leagueChange = compareOptionalLevel(
      previous.leagueLevel,
      current.leagueLevel
    )

    events.push({
      type: 'transfer',
      seasonKey: current.seasonKey || previous.seasonKey || '',
      fromClubId: previous.clubId,
      toClubId: current.clubId,
      fromClubStrengthLevel: previous.clubStrengthLevel || previous.clubLevel || 0,
      toClubStrengthLevel: current.clubStrengthLevel || current.clubLevel || 0,
      fromLeagueLevel: previous.leagueLevel || 0,
      toLeagueLevel: current.leagueLevel || 0,
      direction: resolveTransferDirection({ clubChange, leagueChange }),
      sameSeason: previous.seasonOrder === current.seasonOrder,
    })
  }

  return events
}
