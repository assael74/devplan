// src/features/playersDatabase/ui/components/modals/workTask/useWorkTaskModal.js

import * as React from 'react'

import { createEntity } from '../../../../../../application/actions/entities/createEntity.action.js'
import useWorkTaskLeagueFlow from './useWorkTaskLeagueFlow.js'
import useWorkTaskTeamFlow from './useWorkTaskTeamFlow.js'
import {
  LEAGUE_PAGE_ROUTE,
  TEAM_ROUTE,
  buildLeaguePageTaskDraft,
  buildLeagueTaskDraft,
  buildTeamTaskDraft,
  clean,
  getWorkTaskSteps,
} from './workTask.model.js'

const EMPTY_MODEL = {}
const EMPTY_OPTIONS = []

export default function useWorkTaskModal({
  open,
  model,
  leagueContext,
  mode,
  onClose,
}) {
  const teamMode = mode === 'team'
  const safeModel = model || EMPTY_MODEL
  const allRows = Array.isArray(safeModel.allRows)
    ? safeModel.allRows
    : EMPTY_OPTIONS
  const levelOptions = Array.isArray(safeModel.levelOptions)
    ? safeModel.levelOptions
    : EMPTY_OPTIONS
  const birthYearOptions = Array.isArray(safeModel.birthYearOptions)
    ? safeModel.birthYearOptions
    : EMPTY_OPTIONS
  const leagueDocuments = Array.isArray(safeModel.leagueDocuments)
    ? safeModel.leagueDocuments
    : EMPTY_OPTIONS
  const initialBirthYear = safeModel.birthYear === 'all' ? '' : safeModel.birthYear
  const initialLeagueLevel = safeModel.leagueLevel === 'all'
    ? ''
    : safeModel.leagueLevel
  const [activeStep, setActiveStep] = React.useState(0)
  const [workRoute, setWorkRoute] = React.useState('')
  const [createLoading, setCreateLoading] = React.useState(false)
  const [createError, setCreateError] = React.useState('')

  React.useEffect(() => {
    if (!open) return

    setActiveStep(0)
    setWorkRoute(
      teamMode
        ? TEAM_ROUTE
        : leagueContext
        ? LEAGUE_PAGE_ROUTE
        : ''
    )
    setCreateLoading(false)
    setCreateError('')
  }, [
    leagueContext,
    open,
    teamMode,
  ])

  const leagueFlow = useWorkTaskLeagueFlow({
    open,
    workRoute,
    allRows,
    levelOptions,
    birthYearOptions,
    initialBirthYear,
    initialLeagueLevel,
    leagueContext,
  })

  const teamFlow = useWorkTaskTeamFlow({
    open,
    workRoute,
    allRows,
    birthYearOptions,
    initialBirthYear,
    leagueDocuments,
  })

  const steps = React.useMemo(() => getWorkTaskSteps(workRoute), [workRoute])

  const canContinue = React.useMemo(() => {
    if (workRoute === LEAGUE_PAGE_ROUTE) {
      if (activeStep === 0) return Boolean(leagueFlow.leagueTaskType)
      if (leagueFlow.leagueTaskType === 'teams') return true
      return Boolean(leagueFlow.leagueTeamId)
    }

    if (activeStep === 0) return Boolean(workRoute)

    if (workRoute === TEAM_ROUTE) {
      if (activeStep === 1) {
        return Boolean(
          teamFlow.teamBirthYear &&
          (teamFlow.teamKey || clean(teamFlow.teamInputValue))
        )
      }

      if (activeStep === 2) {
        if (!teamFlow.selectedTeam) return false
        return Boolean(
          teamFlow.selectedAppearanceKey &&
          teamFlow.teamTaskType
        )
      }

      return false
    }

    if (activeStep === 1) return Boolean(leagueFlow.birthYear)
    if (activeStep === 2) return Boolean(leagueFlow.leagueLevel)
    if (activeStep === 3) return Boolean(leagueFlow.selectedLeagueKey)

    return false
  }, [
    activeStep,
    leagueFlow.birthYear,
    leagueFlow.leagueLevel,
    leagueFlow.leagueTaskType,
    leagueFlow.leagueTeamId,
    leagueFlow.selectedLeagueKey,
    teamFlow.selectedAppearanceKey,
    teamFlow.selectedTeam,
    teamFlow.teamBirthYear,
    teamFlow.teamInputValue,
    teamFlow.teamKey,
    teamFlow.teamTaskType,
    workRoute,
  ])

  const handleRouteChange = route => {
    setWorkRoute(route)
    leagueFlow.resetRouteContext()
    setCreateError('')
  }

  const handleCreateTask = async () => {
    if (createLoading) return

    const draft = workRoute === LEAGUE_PAGE_ROUTE
      ? buildLeaguePageTaskDraft({
        leagueContext,
        taskType: leagueFlow.leagueTaskType,
        selectedTeam: leagueFlow.selectedLeagueTaskTeam,
      })
      : workRoute === TEAM_ROUTE
      ? buildTeamTaskDraft({
        selectedTeam: teamFlow.selectedTeam,
        selectedAppearance: teamFlow.selectedAppearance,
        teamBirthYear: teamFlow.teamBirthYear,
        teamTaskType: teamFlow.teamTaskType,
      })
      : buildLeagueTaskDraft({
        selectedLeague: leagueFlow.selectedLeague,
        birthYear: leagueFlow.birthYear,
        leagueLevel: leagueFlow.leagueLevel,
      })

    setCreateLoading(true)
    setCreateError('')

    const result = await createEntity({
      entityType: 'task',
      draft,
    })

    if (!result?.ok) {
      setCreateLoading(false)
      setCreateError(result?.error?.message || 'יצירת המשימה נכשלה')
      return
    }

    setCreateLoading(false)
    onClose()
  }

  const handleNext = () => {
    if (!canContinue || createLoading) return

    if (activeStep === steps.length - 1) {
      handleCreateTask()
      return
    }

    setActiveStep(step => Math.min(step + 1, steps.length - 1))
  }

  const handleBack = () => {
    setActiveStep(step => Math.max(step - 1, 0))
  }

  const leagueFlowActions = {
    ...leagueFlow.actions,
    onRouteChange: handleRouteChange,
    onBirthYearChange: value => {
      leagueFlow.actions.onBirthYearChange(value)
      setCreateError('')
    },
    onLeagueSelect: rowKey => {
      leagueFlow.actions.onLeagueSelect(rowKey)
      setCreateError('')
    },
    onLeagueTaskTypeChange: taskType => {
      leagueFlow.actions.onLeagueTaskTypeChange(taskType)
      setCreateError('')
    },
    onLeagueTeamSelect: teamId => {
      leagueFlow.actions.onLeagueTeamSelect(teamId)
      setCreateError('')
    },
  }

  const teamFlowActions = {
    ...teamFlow.actions,
    onTeamBirthYearChange: value => {
      teamFlow.actions.onTeamBirthYearChange(value)
      setCreateError('')
    },
    onTeamInputChange: value => {
      teamFlow.actions.onTeamInputChange(value)
      setCreateError('')
    },
    onTeamChange: team => {
      teamFlow.actions.onTeamChange(team)
      setCreateError('')
    },
    onTeamTaskTypeChange: taskType => {
      teamFlow.actions.onTeamTaskTypeChange(taskType)
      setCreateError('')
    },
  }

  const actionLabel = activeStep === steps.length - 1
    ? 'אישור משימה'
    : 'המשך'

  return {
    activeStep,
    workRoute,
    steps,
    leagueFlowModel: leagueFlow.model,
    leagueFlowActions,
    teamFlowModel: teamFlow.model,
    teamFlowActions,
    canContinue,
    createLoading,
    createError,
    selectedTeam: teamFlow.selectedTeam,
    actionLabel,
    handleNext,
    handleBack,
  }
}
