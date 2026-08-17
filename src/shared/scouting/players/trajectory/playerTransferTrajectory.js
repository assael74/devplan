// src/shared/scouting/players/trajectory/playerTransferTrajectory.js

import {
  PLAYER_TRANSFER_DIRECTION,
} from './playerTrajectory.model.js'

import {
  compareCompetitiveLevel,
  getDelta,
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

const resolveMoveType = direction => {
  if (direction === PLAYER_TRANSFER_DIRECTION.UP) return 'upgrade'
  if (direction === PLAYER_TRANSFER_DIRECTION.DOWN) return 'downgrade'
  if (direction === PLAYER_TRANSFER_DIRECTION.LATERAL) return 'lateral'
  if (direction === PLAYER_TRANSFER_DIRECTION.MIXED) return 'mixed'
  return 'unknown'
}

const buildProfileChange = (previous = {}, current = {}) => {
  const previousIds = new Set(previous.profileIds || [])
  const currentIds = new Set(current.profileIds || [])

  return {
    added: [...currentIds].filter(profileId => !previousIds.has(profileId)),
    lost: [...previousIds].filter(profileId => !currentIds.has(profileId)),
    retained: [...currentIds].filter(profileId => previousIds.has(profileId)),
  }
}

const buildTransferImpact = (previous = {}, current = {}) => ({
  minutesPctDelta: getDelta(previous.minutesPct, current.minutesPct),
  startsPctDelta: getDelta(previous.startsPct, current.startsPct),
  goalsPer90Delta: getDelta(previous.goalsPer90, current.goalsPer90),
  roleChanged: Boolean(
    (previous.primaryPosition || current.primaryPosition) &&
    previous.primaryPosition !== current.primaryPosition
  ),
  positionLayerChanged: Boolean(
    (previous.positionLayer || current.positionLayer) &&
    previous.positionLayer !== current.positionLayer
  ),
  profileChange: buildProfileChange(previous, current),
})

export const buildPlayerTransferEvents = (stints = []) => {
  const events = []

  for (let index = 1; index < stints.length; index += 1) {
    const previous = stints[index - 1]
    const current = stints[index]

    if (!hasClubChanged(previous, current)) continue

    const clubChange = compareCompetitiveLevel(
      previous.clubStrengthLevel || previous.clubLevel,
      current.clubStrengthLevel || current.clubLevel
    )
    const leagueChange = compareCompetitiveLevel(
      previous.leagueLevel,
      current.leagueLevel
    )
    const direction = resolveTransferDirection({ clubChange, leagueChange })

    events.push({
      type: 'transfer',
      seasonKey: current.seasonKey || previous.seasonKey || '',
      fromClubId: previous.clubId,
      fromClubName: previous.clubName || '',
      fromBirthTeamId: previous.birthTeamId || '',
      fromBirthTeamDocumentId: previous.birthTeamDocumentId || '',
      fromTeamName: previous.teamName || previous.clubName || '',
      toClubId: current.clubId,
      toClubName: current.clubName || '',
      toBirthTeamId: current.birthTeamId || '',
      toBirthTeamDocumentId: current.birthTeamDocumentId || '',
      toTeamName: current.teamName || current.clubName || '',
      fromClubStrengthLevel: previous.clubStrengthLevel || previous.clubLevel || 0,
      toClubStrengthLevel: current.clubStrengthLevel || current.clubLevel || 0,
      fromLeagueLevel: previous.leagueLevel || 0,
      toLeagueLevel: current.leagueLevel || 0,
      clubStrengthChange: clubChange,
      leagueLevelChange: leagueChange,
      direction,
      moveType: resolveMoveType(direction),
      sameSeason: previous.seasonOrder === current.seasonOrder,
      fromPrimaryPosition: previous.primaryPosition || '',
      toPrimaryPosition: current.primaryPosition || '',
      fromPositionLayer: previous.positionLayer || '',
      toPositionLayer: current.positionLayer || '',
      impact: buildTransferImpact(previous, current),
    })
  }

  return events
}
