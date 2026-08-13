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
  reliability,
  scoutContext,
  futureCompetitionPath,
  playerTrajectory,
} = {}) => {
  return [
    ...buildPlayerCurrentSpotlights({
      profile,
      player,
      metrics,
      reliability,
      scoutContext,
    }),
    ...buildPlayerFutureSpotlights({ futureCompetitionPath }),
    ...buildPlayerTrajectorySpotlights({ playerTrajectory }),
  ]
}
