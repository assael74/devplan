// src/features/hub/hooks/meetings/useMeetingHubCreate.js

import {
  resolveMeetingCreateName,
  resolveStaticEntityType,
  useHubCreateAction,
} from '../shared/index.js'

const resolveMeetingType = resolveStaticEntityType('meeting')

export default function useMeetingHubCreate() {
  const { saving, runCreate } = useHubCreateAction({
    resolveActionEntityType: resolveMeetingType,
    notificationEntityType: 'meeting',
    resolveEntityName: resolveMeetingCreateName,
  })

  return {
    saving,
    runCreateMeeting: runCreate,
  }
}
