/// teamProfile/components/TeamProfileFab.js
import React from 'react'
import GenericFabMenu from '../../../../ui/actions/GenericFabMenu'
import { buildFabActions } from '../../../../ui/actions/fabActions.factory'
import { useCreateModal } from '../../../../ui/forms/create/CreateModalProvider'
import { getEntityColors } from '../../../../ui/core/theme/Colors'

const FAB_ENTITY_BY_TAB = {
  games: 'team',
  players: 'player',
}

function presetForTab(tab, entity, context) {
  const teamId = entity?.id || null
  const clubId = context?.club?.id || entity?.clubId || null

  if (tab === 'players') return { teamId, clubId }
  if (tab === 'games') return { teamId, clubId }
  return { teamId, clubId }
}

export default function TeamProfileFab({ entity, context, tab }) {
  const { openCreate } = useCreateModal()

  const actions = React.useMemo(() => {
    return buildFabActions({
      area: 'team',
      mode: tab,
      permissions: { allowCreate: true },
      handlers: {
        onAddGame: () => {
          openCreate('game', presetForTab('games', entity, context), { team: entity, ...(context || {}) })
        },
        onAddGames: () => {
          openCreate('games', presetForTab('games', entity, context), { team: entity, ...(context || {}) })
        },
        onCreatePlayer: () => {
          openCreate('player', presetForTab('players', entity, context), { team: entity, ...(context || {}) })
        },
        onCreatePlayers: () => {
          openCreate('players', presetForTab('players', entity, context), { team: entity, ...(context || {}) })
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
