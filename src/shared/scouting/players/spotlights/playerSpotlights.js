// src/shared/scouting/players/spotlights/playerSpotlights.js

import {
  buildPlayerCurrentSpotlights,
} from './playerCurrentSpotlights.js'

import {
  buildPlayerFutureSpotlights,
} from './playerFutureSpotlights.js'

import {
  buildPlayerTrajectorySpotlights,
} from './playerTrajectorySpotlights.js'

export const buildPlayerScoutSpotlights = ({
  profile,
  player,
  metrics,
  scoutContext,
  futureCompetitionPath,
  playerTrajectory,
  currentSeasonKey,
  currentSeasonStatus,
} = {}) => {
  return [
    ...buildPlayerCurrentSpotlights({
      profile,
      player,
      metrics,
          scoutContext,
    }),
    ...buildPlayerFutureSpotlights({
      futureCompetitionPath,
      currentSeasonKey,
      currentSeasonStatus,
    }),
    ...buildPlayerTrajectorySpotlights({ playerTrajectory }),
  ]
}
