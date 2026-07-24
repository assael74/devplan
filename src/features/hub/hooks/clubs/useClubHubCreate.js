// src/features/hub/hooks/clubs/useClubHubCreate.js

import {
  resolveClubCreateName,
  resolveStaticEntityType,
  useHubCreateAction,
} from '../shared/index.js'

const resolveClubType = resolveStaticEntityType('club')

export default function useClubHubCreate() {
  const { saving, runCreate } = useHubCreateAction({
    resolveActionEntityType: resolveClubType,
    notificationEntityType: 'club',
    resolveEntityName: resolveClubCreateName,
  })

  return {
    saving,
    runCreateClub: runCreate,
  }
}
