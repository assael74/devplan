// src/features/hub/hooks/teams/useTeamHubUpdate.js

import { useUpdateAction } from '../../../../ui/domains/entityActions/updateAction.js'

export function useTeamHubUpdate(active) {
  const teamUpdate = useUpdateAction({
    routerEntityType: 'teams',
    snackEntityType: 'team',
    id: active?.id,
    entityName: active?.teamName || 'קבוצה',
    requireAnyUpdated: true,
  })

  const run = (type, patch, meta) => {
    const update = teamUpdate
    const teamId = meta?.teamId || active?.id
    console.log(patch)
    return update.runUpdate(patch, {
      ...meta,
      id: teamId,
      teamId,
      createIfMissing: meta?.createIfMissing ?? false,
    })
  }

  return { run, pending: teamUpdate.pending }
}
