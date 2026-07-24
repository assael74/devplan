// src/application/actions/teamCascade/prepareTeamCascadeDeletePlan.action.js

import { collectTeamCascadeDeletePlan } from '../../../shared/entityLifecycle/cascade/team/collectTeamCascadeDeletePlan.js'

export function prepareTeamCascadeDeletePlan({ entity, shorts } = {}) {
  if (!entity?.id) {
    throw new Error('[teamCascadeDelete] entity.id is required')
  }

  return collectTeamCascadeDeletePlan({
    teamId: entity.id,
    shorts,
    seed: {
      team: entity,
      club: entity?.club || null,
      players: entity?.players || [],
      games: entity?.teamGames || entity?.games || [],
      meetings: entity?.meetings || [],
      payments: entity?.payments || [],
    },
  })
}
