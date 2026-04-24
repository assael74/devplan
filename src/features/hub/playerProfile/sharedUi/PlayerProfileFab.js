// features/hub/clubProfile/sharedUi/PlayerProfileFab.js

import React from 'react'
import GenericFabMenu from '../../../../ui/actions/GenericFabMenu'
import { buildFabActions } from '../../../../ui/actions/fabActions.factory'
import { useCreateModal } from '../../../../ui/forms/create/CreateModalProvider'
import { getEntityColors } from '../../../../ui/core/theme/Colors'
import { buildTaskPresetDraft } from '../../../../ui/forms/helpers/tasksForm.helpers.js'

const FAB_ENTITY_BY_TAB = {
  payments: 'player',
  meetings: 'player',
  abilities: 'player',
  videoAnalysis: 'videoAnalysis',
  games: 'player',
  performance: 'player',
  trainings: 'player',
}

function presetForTab(tab, entity, context) {
  const playerId = entity?.id || null
  const teamId = context?.team?.id || entity?.teamId || null
  const clubId = context?.club?.id || entity?.clubId || null

  if (tab === 'meetings') return { playerId, teamId, clubId }
  if (tab === 'payments') return { playerId, teamId, clubId }
  if (tab === 'videoAnalysis') return { playerId, teamId, clubId }
  if (tab === 'abilities') return { playerId, teamId, clubId }

  return { playerId, teamId, clubId }
}

export default function PlayerProfileFab({
  entity,
  context,
  tab,
  taskContext,
  onOpenMeetingsInsights,
  onOpenPaymentsInsights,
  onOpenAbilitiesInsights,
  onOpenVideoInsights,
  onOpenGamesInsights,
  onOpenPerformanceInsights,
  onOpenTrainingsInsights,
}) {
  const { openCreate } = useCreateModal()

  const actions = React.useMemo(() => {
    return buildFabActions({
      area: 'player',
      mode: tab,
      taskContext,
      permissions: { allowCreate: true },
      handlers: {
        onAddMeeting: () => {
          openCreate('meeting', presetForTab('meetings', entity, context), {
            player: entity,
            ...(context || {}),
          })
        },

        onAddPayment: () => {
          openCreate('payment', presetForTab('payments', entity, context), {
            player: entity,
            ...(context || {}),
          })
        },

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

        onAddTask: (taskCtx = {}) =>
          openCreate(
            'task',
            buildTaskPresetDraft(taskCtx),
            { ...context, ...taskCtx },
            {
              surface: 'drawer',
              drawerAnchor: 'bottom',
              drawerWidth: 900,
            }
          ),

        onOpenMeetingsInsights: () => onOpenMeetingsInsights?.(),
        onOpenPaymentsInsights: () => onOpenPaymentsInsights?.(),
        onOpenAbilitiesInsights: () => onOpenAbilitiesInsights?.(),
        onOpenVideoInsights: () => onOpenVideoInsights?.(),
        onOpenGamesInsights: () => onOpenGamesInsights?.(),
        onOpenPerformanceInsights: () => onOpenPerformanceInsights?.(),
        onOpenTrainingsInsights: () => onOpenTrainingsInsights?.(),
      },
    })
  }, [
    tab,
    openCreate,
    entity,
    context,
    taskContext,
    onOpenMeetingsInsights,
    onOpenPaymentsInsights,
    onOpenAbilitiesInsights,
    onOpenVideoInsights,
    onOpenGamesInsights,
    onOpenPerformanceInsights,
    onOpenTrainingsInsights,
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
