// features/hub/clubProfile/mobile/components/ClubProfileFab.js

import React from 'react'
import GenericFabMenu from '../../../../../ui/actions/GenericFabMenu'
import { buildFabActions } from '../../../../../ui/actions/fabActions.factory'
import { useCreateModal } from '../../../../../ui/forms/create/CreateModalProvider'
import { getEntityColors } from '../../../../../ui/core/theme/Colors'

const FAB_ENTITY_BY_TAB = {
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

export default function ClubProfileFab({ entity, context, tab }) {
  const { openCreate } = useCreateModal()

  const actions = React.useMemo(() => {
    return buildFabActions({
      area: 'club',
      mode: tab,
      permissions: { allowCreate: true },
      handlers: {
        // ✅ names חייבים להתאים ל-buildFabActions
        onCreateTeam: () => {
          openCreate('team', presetForTab('teams', entity), { club: entity, ...(context || {}) })
        },
        onCreatePlayer: () => {
          openCreate('player', presetForTab('players', entity), { club: entity, ...(context || {}) })
        },
      },
    })
  }, [tab, openCreate, entity, context])

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
              '&:hover': { bgcolor: fabColors.accent, filter: 'brightness(0.95)' },
              '&:active': { filter: 'brightness(0.9)' },
            }
          : undefined
      }
    />
  )
}
