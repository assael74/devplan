// src/features/hub/hooks/players/usePlayerHubCreate.js

import {
  resolvePlayerCreateName,
  resolvePlayerCreateType,
  useHubCreateAction,
} from '../shared/index.js'

export default function usePlayerHubCreate() {
  const { saving, runCreate } = useHubCreateAction({
    resolveActionEntityType: resolvePlayerCreateType,
    notificationEntityType: 'player',
    resolveEntityName: resolvePlayerCreateName,
  })

  return {
    saving,
    runCreatePlayer: runCreate,
  }
}
