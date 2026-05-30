// playerProfile/sharedModules/trainings/usePlayerTrainingsModuleModel.js

import { useCallback, useMemo, useState } from 'react'

import {
  resolvePlayerTrainingsDomain,
  buildTrainingsModel,
  buildTrainingsHeaderStats,
} from '../../sharedLogic'

export default function usePlayerTrainingsModuleModel({
  entity,
  context,
  buildMobileModel = false,
}) {
  const player = entity || null

  const domain = useMemo(() => {
    return resolvePlayerTrainingsDomain(player, {}, {
      trainingWeeks: context?.trainingWeeks,
      playerTrainingWeeksById: context?.playerTrainingWeeksById,
    })
  }, [
    player,
    context?.trainingWeeks,
    context?.playerTrainingWeeksById,
  ])

  const {
    summary,
    state,
    trainingWeeks,
  } = domain || {}

  const [createOpen, setCreateOpen] = useState(false)
  const [editingDay, setEditingDay] = useState(null)

  const model = useMemo(() => {
    if (!buildMobileModel) return null

    return buildTrainingsModel({
      entity: player,
      trainingWeeks,
    })
  }, [buildMobileModel, player, trainingWeeks])

  const stats = useMemo(() => {
    if (!buildMobileModel) return null

    return buildTrainingsHeaderStats(model)
  }, [buildMobileModel, model])

  const teamId = String(player?.teamId || player?.team?.id || '').trim()

  const handleCreateWeek = useCallback(() => {
    if (!teamId) return
    setCreateOpen(true)
  }, [teamId])

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false)
  }, [])

  const handleEditRow = useCallback(row => {
    if (!row?.weekId || !row?.dayKey) return

    setEditingDay(row)
  }, [])

  const handleCloseEdit = useCallback(() => {
    setEditingDay(null)
  }, [])

  return {
    player,
    teamId,

    summary,
    state,
    trainingWeeks,

    model,
    stats,

    createOpen,
    editingDay,

    setCreateOpen,
    setEditingDay,

    handleCreateWeek,
    handleCloseCreate,
    handleEditRow,
    handleCloseEdit,
  }
}
