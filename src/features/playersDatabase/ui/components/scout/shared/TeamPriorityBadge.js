// src/features/playersDatabase/ui/components/scout/shared/TeamPriorityBadge.js

import ScoutPriority from '../../../../../../ui/patterns/scout/ScoutPriority.js'
import { buildTeamPriorityDetails } from '../../../../model/team/teamPriorityDetails.model.js'

export default function TeamPriorityBadge({
  side,
  view = {},
  teamName = '',
  team = {},
  short = false,
  fontSize = 13,
}) {
  return (
    <ScoutPriority
      value={view.priority?.level || 'unavailable'}
      details={buildTeamPriorityDetails({ side, view, teamName, team })}
      short={short}
      fontSize={fontSize}
    />
  )
}
