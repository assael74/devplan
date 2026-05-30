// teamProfile/sharedModules/trainings/useTeamTrainingsModuleModel.js

import { useCallback, useMemo, useState } from 'react'

import {
  resolveTeamTrainingsDomain,
  buildTrainingsModel,
  buildTrainingsHeaderStats,
} from '../../sharedLogic/trainings'

export default function useTeamTrainingsModuleModel({
  entity,
  context,
  buildMobileModel = false,
}) {
  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []

    return teams.find(t => t?.id === entity?.id) || entity || null
  }, [context?.teams, entity])

  const domain = useMemo(() => {
    return resolveTeamTrainingsDomain(liveTeam, {}, {
      trainingWeeks: context?.trainingWeeks,
      teamTrainingWeeksById: context?.teamTrainingWeeksById,
    })
  }, [
    liveTeam,
    context?.trainingWeeks,
    context?.teamTrainingWeeksById,
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
      entity: liveTeam,
      trainingWeeks,
    })
  }, [buildMobileModel, liveTeam, trainingWeeks])

  const stats = useMemo(() => {
    if (!buildMobileModel) return null

    return buildTrainingsHeaderStats(model)
  }, [buildMobileModel, model])

  const teamId = liveTeam?.id

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
    liveTeam,
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
