// src/features/hub/hooks/useMeetingHubUpdate.js

import { useUpdateAction } from '../../../ui/domains/entityActions/updateAction.js'

export function useMeetingHubUpdate(active) {
  const meetingUpdate = useUpdateAction({
    routerEntityType: 'meetings',
    snackEntityType: 'meeting',
    id: active?.id,
    entityName: '',
    requireAnyUpdated: true,
  })

  const run = (type, patch, meta) => {
    const meetingId = meta?.meetingId || active?.id

    return meetingUpdate.runUpdate(patch, {
      ...meta,
      id: meetingId,
      meetingId,
      createIfMissing: false,
    })
  }

  return { run, pending: meetingUpdate.pending }
}
