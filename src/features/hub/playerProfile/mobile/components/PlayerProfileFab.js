// playerProfile/mobile/components/PlayerProfileFab.js

import React from 'react'
import GenericFabMenu from '../../../../../ui/actions/GenericFabMenu'
import { buildFabActions } from '../../../../../ui/actions/fabActions.factory'
import { useCreateModal } from '../../../../../ui/forms/create/CreateModalProvider'
import { getEntityColors } from '../../../../../ui/core/theme/Colors'

const FAB_ENTITY_BY_TAB = {
  payments: 'player',
  meetings: 'player',
  abilities: 'player',
  videoAnalysis: 'videoAnalysis'
}

function presetForTab(tab, entity, context) {
  const pid = entity?.id
  const teamId = context?.team?.id || entity?.teamId || null
  const clubId = context?.club?.id || entity?.clubId || null
  return { playerId: pid, teamId, clubId }
}

function createTypeForTab(tab) {
  if (tab === 'meetings') return 'meeting'
  if (tab === 'payments') return 'payment'
  if (tab === 'videoAnalysis') return 'videoAnalysis'
  if (tab === 'abilities') return 'abilities'
  return null
}

export default function PlayerProfileFab({ entity, context, tab }) {
  const { openCreate } = useCreateModal()

  const actions = React.useMemo(() => {
    return buildFabActions({
      area: 'player',
      mode: tab,
      permissions: { allowCreate: true },
      handlers: {
        onAddMeeting: () => {
          const type = createTypeForTab('meetings')
          if (!type) return
          openCreate(type, presetForTab('meetings', entity, context), { player: entity, ...context })
        },
        onAddPayment: () => {
          const type = createTypeForTab('payments')
          if (!type) return
          openCreate(type, presetForTab('payments', entity, context), { player: entity, ...context })
        },
        onAddVideoAnalysis: () => {
          const type = createTypeForTab('videoAnalysis')
          if (!type) return
          openCreate(type, presetForTab('videoAnalysis', entity, context), { player: entity, ...context })
        },
        onAddAbilities: () => {
          const type = createTypeForTab('abilities')
          if (!type) return
          openCreate(type, presetForTab('abilities', entity, context), { player: entity, ...context })
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
