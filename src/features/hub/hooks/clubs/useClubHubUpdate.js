// src/features/hub/hooks/clubs/useClubHubUpdate.js

import { useUpdateAction } from '../../../../ui/domains/entityActions/updateAction.js'

export function useClubHubUpdate(active) {
  const clubUpdate = useUpdateAction({
    routerEntityType: 'clubs',
    snackEntityType: 'club',
    id: active?.id,
    entityName: active?.clubName || 'מועדון',
    requireAnyUpdated: true,
  })

  const run = (type, patch, meta) => {
    const update = clubUpdate
    const clubId = meta?.clubId || active?.id

    return update.runUpdate(patch, {
      ...meta,
      id: clubId,
      clubId,
      createIfMissing: meta?.createIfMissing ?? false,
    })
  }

  return { run, pending: clubUpdate.pending }
}
