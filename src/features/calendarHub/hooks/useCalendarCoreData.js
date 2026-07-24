// src/features/calendarHub/hooks/useCalendarCoreData.js

import { useMemo } from 'react'
import { useCoreData } from '../../coreData/CoreDataProvider.js'

export default function useCalendarCoreData() {
  const core = useCoreData()

  return useMemo(() => ({
    players: core?.players || [],
    teams: core?.teams || [],
    clubs: core?.clubs || [],
    loading: core?.sourceStatus
      ? ['players', 'teams', 'clubs'].some((key) => core.sourceStatus[key] === false)
      : Boolean(core?.loading),
    error: core?.sourceErrors?.players ||
      core?.sourceErrors?.teams ||
      core?.sourceErrors?.clubs ||
      core?.error ||
      null,
  }), [
    core?.players,
    core?.teams,
    core?.clubs,
    core?.sourceStatus,
    core?.sourceErrors,
    core?.loading,
    core?.error,
  ])
}
