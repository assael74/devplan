// features/hub/clubProfile/sharedUi/ClubProfileFab.js

import React from 'react'
import GenericFabMenu from '../../../../ui/actions/GenericFabMenu'
import { buildFabActions } from '../../../../ui/actions/fabActions.factory'
import { useCreateModal } from '../../../../ui/forms/create/CreateModalProvider'
import { getEntityColors } from '../../../../ui/core/theme/Colors'
import { buildTaskPresetDraft } from '../../../../ui/forms/helpers/tasksForm.helpers.js'

const FAB_ENTITY_BY_TAB = {
  management: 'club',
  teams: 'team',
  players: 'player',
}

function presetForTab(tab, club) {
  const clubId = club?.id
  if (!clubId) return {}
  if (tab === 'teams') return { clubId }
  if (tab === 'players') return { clubId }
  return { clubId }
}

export default function ClubProfileFab({
  entity,
  context,
  tab,
  taskContext,
  onOpenTeamsInsights,
  onOpenPlayersInsights,
}) {
  const { openCreate } = useCreateModal()

  const actions = React.useMemo(() => {
    return buildFabActions({
      area: 'club',
      mode: tab,
      taskContext,
      permissions: { allowCreate: true },
      handlers: {
        onAddTeam: () => {
          openCreate('team', presetForTab('teams', entity, context), {
            team: entity,
            ...(context || {}),
          })
        },

        onAddTask: (taskCtx = {}) =>
          openCreate(
            'task',
            buildTaskPresetDraft(taskCtx),
            { ...context, ...taskCtx },
          ),

        onOpenPlayersInsights: () => onOpenPlayersInsights(),
        onOpenTeamsInsights: () => onOpenTeamsInsights(),
      },
    })
  }, [
    tab,
    openCreate,
    entity,
    context,
    taskContext,
    onOpenPlayersInsights,
    onOpenTeamsInsights,
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
