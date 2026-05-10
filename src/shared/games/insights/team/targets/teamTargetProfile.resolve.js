// shared/games/insights/team/targets/teamTargetProfile.resolve.js

import {
  getTeamGamesTargetProfileById,
  resolveTeamGamesTargetProfileByProjectedPoints,
} from '../../../../teams/targets/index.js'

import { resolveTeamTargetPositionFromTeam } from './teamTargetPosition.resolve.js'

export function resolveTeamTargetProfileFromTeam(team = {}) {
  const targets = team?.targets || {}
  const targetPosition = resolveTeamTargetPositionFromTeam(team)

  const profileId =
    targetPosition?.resolvedProfileId ||
    targets?.targetProfileId ||
    targets?.benchmarkLevelId ||
    team?.targetProfileId ||
    team?.benchmarkLevelId ||
    null

  const targetProfile = getTeamGamesTargetProfileById(profileId)

  return {
    targetPosition,
    targetProfile,
    targetProfileId: targetProfile?.id || null,
  }
}

export function resolveTeamForecastProfileFromActive(active = {}) {
  return resolveTeamGamesTargetProfileByProjectedPoints(
    active?.projectedTotalPoints
  )
}
