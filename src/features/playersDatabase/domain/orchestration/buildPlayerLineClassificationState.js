// src/features/playersDatabase/domain/orchestration/buildPlayerLineClassificationState.js

import {
  buildTeamPlayerLineClassification,
} from '../../../../shared/scouting/teams/index.js'

export const buildPlayerLineClassificationState = ({
  player = {},
  team = {},
  season = {},
} = {}) => (
  buildTeamPlayerLineClassification({ player, team, season })
)
