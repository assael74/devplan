// features/hub/clubProfile/sharedUi/PlayerProfileFab.js

import React from 'react'
import GenericFabMenu from '../../../../ui/actions/GenericFabMenu'
import { buildFabActions } from '../../../../ui/actions/fabActions.factory'
import { useCreateModal } from '../../../../ui/forms/create/CreateModalProvider'
import { getEntityColors } from '../../../../ui/core/theme/Colors'
import { buildTaskPresetDraft } from '../../../../ui/forms/tasks/taskForm.helpers.js'

const FAB_ENTITY_BY_TAB = {
  payments: 'player',
  meetings: 'player',
  abilities: 'player',
  videoAnalysis: 'videoAnalysis',
  games: 'player',
  performance: 'player',
  trainings: 'player',
}

function presetForTab(tab, entity, context, isPrivatePlayer = false) {
  const playerId = entity?.id || null
  const teamId = context?.team?.id || entity?.teamId || null
  const clubId = context?.club?.id || entity?.clubId || null

  if (isPrivatePlayer && (tab === 'meetings' || tab === 'payments')) {
    return { playerId }
  }

  if (tab === 'meetings') return { playerId, teamId, clubId }
  if (tab === 'payments') return { playerId, teamId, clubId }
  if (tab === 'videoAnalysis') return { playerId, teamId, clubId }
  if (tab === 'abilities') return { playerId, teamId, clubId }

  return { playerId, teamId, clubId }
}

function buildGamePreset({ entity, context, isPrivatePlayer }) {
  const base = presetForTab('games', entity, context)

  if (!isPrivatePlayer) return base

  return {
    ...base,
    playerId: entity?.id || '',
    teamId: entity?.teamId || '',
    clubId: entity?.clubId || '',
    teamName: entity?.teamName || '',
    clubName: entity?.clubName || '',
    isSelected: true,
    isStarting: false,
    goals: 0,
    assists: 0,
    timePlayed: 0,
    gameSource: 'external',
    isExternalGame: true,
    isPrivatePlayer: true,
  }
}

function buildGameContext({ entity, context, isPrivatePlayer }) {
  return {
    ...(context || {}),
    player: entity,
    isPrivatePlayer,
    playerSource: entity?.playerSource || '',
  }
}

export default function PlayerProfileFab({
  entity,
  context,
  tab,
  taskContext,
  isPrivatePlayer = false,
  onOpenMeetingsInsights,
  onOpenPaymentsInsights,
  onOpenAbilitiesInsights,
  onOpenVideoInsights,
  onOpenGamesInsights,
  onOpenPerformanceInsights,
  onOpenTrainingsInsights,
  onImportGames,
}) {
  const { openCreate } = useCreateModal()

  const actions = React.useMemo(() => {
    const builtActions = buildFabActions({
      area: 'player',
      mode: tab,
      taskContext,
      permissions: {
        allowCreate: true,
        allowGamesCreate: isPrivatePlayer,
      },
      handlers: {
        onAddMeeting: () => {
          openCreate('meeting', presetForTab('meetings', entity, context, isPrivatePlayer), {
            player: entity,
            ...(context || {}),
          })
        },

        onAddPayment: () => {
          openCreate(
            isPrivatePlayer ? 'privatePaymentAgreement' : 'payment',
            presetForTab('payments', entity, context, isPrivatePlayer),
            {
              player: entity,
              isPrivatePlayer,
              ...(context || {}),
            }
          )
        },

        onAddGame: () => {
          openCreate(
            'game',
            buildGamePreset({ entity, context, isPrivatePlayer }),
            buildGameContext({ entity, context, isPrivatePlayer })
          )
        },

        onAddGames: () => {
          openCreate(
            'games',
            buildGamePreset({ entity, context, isPrivatePlayer }),
            buildGameContext({ entity, context, isPrivatePlayer })
          )
        },

        onImportGames: () => onImportGames?.(),

        onAddVideoAnalysis: () => {
          openCreate('videoAnalysis', presetForTab('videoAnalysis', entity, context), {
            player: entity,
            ...(context || {}),
          })
        },

        onAddAbilities: () => {
          openCreate('abilities', presetForTab('abilities', entity, context), {
            player: entity,
            ...(context || {}),
          })
        },

        onAddTask: (taskCtx = {}) => {
          openCreate(
            'task',
            buildTaskPresetDraft(taskCtx),
            { ...context, ...taskCtx }
          )
        },

        onOpenMeetingsInsights: () => onOpenMeetingsInsights?.(),
        onOpenPaymentsInsights: () => onOpenPaymentsInsights?.(),
        onOpenAbilitiesInsights: () => onOpenAbilitiesInsights?.(),
        onOpenVideoInsights: () => onOpenVideoInsights?.(),
        onOpenGamesInsights: () => onOpenGamesInsights?.(),
        onOpenPerformanceInsights: () => onOpenPerformanceInsights?.(),
        onOpenTrainingsInsights: () => onOpenTrainingsInsights?.(),
      },
    })

    if (!isPrivatePlayer || tab !== 'payments') return builtActions

    const privateAgreements = Array.isArray(entity?.payments)
      ? entity.payments.filter(payment => payment?.type === 'privateAgreement')
      : []
    const hasOpenAgreement = privateAgreements.some(payment => {
      const totalAmount = Number(payment?.totalAmount || payment?.price || 0)
      const installments = Array.isArray(payment?.installments) ? payment.installments : []
      const paidAmount = installments.reduce((sum, item) => sum + Number(item?.amount || 0), 0)
      return totalAmount > 0 && paidAmount < totalAmount
    })

    return hasOpenAgreement
      ? builtActions.filter(action => action?.id !== 'add-payment')
      : builtActions
  }, [
    tab,
    openCreate,
    entity,
    context,
    taskContext,
    isPrivatePlayer,
    onOpenMeetingsInsights,
    onOpenPaymentsInsights,
    onOpenAbilitiesInsights,
    onOpenVideoInsights,
    onOpenGamesInsights,
    onOpenPerformanceInsights,
    onOpenTrainingsInsights,
    onImportGames,
  ])

  if (!actions?.length) return null

  const fabEntity = FAB_ENTITY_BY_TAB[tab]
  const fabColors = fabEntity ? getEntityColors(fabEntity) : null

  return (
    <GenericFabMenu
      placement="br"
      actions={actions}
      color={fabColors ? 'neutral' : 'primary'}
      fabSx={
        fabColors
          ? {
              bgcolor: fabColors.accent,
              color: '#fff',
              '&:hover': {
                bgcolor: fabColors.accent,
                filter: 'brightness(0.95)',
              },
              '&:active': { filter: 'brightness(0.9)' },
            }
          : undefined
      }
    />
  )
}
