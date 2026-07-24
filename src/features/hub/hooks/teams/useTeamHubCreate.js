// src/features/hub/hooks/teams/useTeamHubCreate.js

import {
  resolveStaticEntityType,
  resolveTeamCreateName,
  useHubCreateAction,
} from '../shared/index.js'

const resolveTeamType = resolveStaticEntityType('team')

export default function useTeamHubCreate() {
  const { saving, runCreate } = useHubCreateAction({
    resolveActionEntityType: resolveTeamType,
    notificationEntityType: 'team',
    resolveEntityName: resolveTeamCreateName,
  })

  return {
    saving,
    runCreateTeam: runCreate,
  }
}
