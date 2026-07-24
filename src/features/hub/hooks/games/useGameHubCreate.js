// src/features/hub/hooks/games/useGameHubCreate.js

import {
  resolveGameCreateName,
  resolveGameCreateType,
  useHubCreateAction,
} from '../shared/index.js'

export default function useGameHubCreate() {
  const { saving, runCreate } = useHubCreateAction({
    resolveActionEntityType: resolveGameCreateType,
    notificationEntityType: 'game',
    resolveEntityName: resolveGameCreateName,
  })

  return {
    saving,
    runCreateGame: runCreate,
  }
}
