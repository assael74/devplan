// features/hub/teamProfile/sharedUi/TeamProfileFab.js

import React from 'react'
import GenericFabMenu from '../../../../ui/actions/GenericFabMenu'
import { buildFabActions } from '../../../../ui/actions/fabActions.factory'
import { useCreateModal } from '../../../../ui/forms/create/CreateModalProvider'
import { getEntityColors } from '../../../../ui/core/theme/Colors'
import { buildTaskPresetDraft } from '../../../../ui/forms/helpers/tasksForm.helpers.js'

const FAB_ENTITY_BY_TAB = {
  games: 'team',
  players: 'player',
  performance: 'player',
  abilities: 'player',
  videos: 'videoAnalysis',
}

const PLAYER_INSIGHTS_IDS = [
  'playersInsights',
  'playerInsights',
  'teamPlayersInsights',
  'openPlayersInsights',
]

function presetForTab(tab, entity, context) {
  const teamId = entity?.id || null
  const clubId = context?.club?.id || entity?.clubId || null

  if (tab === 'players') return { teamId, clubId }
  if (tab === 'games') return { teamId, clubId }
  return { teamId, clubId }
}

const isPlayersInsightsAction = action => {
  const id = String(action?.id || '')
  const label = String(action?.label || action?.title || '')

  return (
    PLAYER_INSIGHTS_IDS.includes(id) ||
    id.toLowerCase().includes('playersinsights') ||
    label.includes('תובנות שחקנים')
  )
}

const getPlayersInsightsMeta = status => {
  if (status === 'ready') {
    return {
      disabled: false,
      metaLabel: '',
      metaColor: 'success',
    }
  }

  if (status === 'loading') {
    return {
      disabled: true,
      metaLabel: 'בטעינה',
      metaColor: 'warning',
    }
  }

  return {
    disabled: true,
    metaLabel: 'אין נתונים',
    metaColor: 'neutral',
  }
}

const decoratePlayersInsightsAction = ({
  action,
  status,
}) => {
  if (!isPlayersInsightsAction(action)) return action

  const meta = getPlayersInsightsMeta(status)

  return {
    ...action,
    disabled: meta.disabled,
    metaLabel: meta.metaLabel,
    metaColor: meta.metaColor,
  }
}

export default function TeamProfileFab({
  entity,
  context,
  tab,
  taskContext,
  playersInsightsStatus = 'empty',
  onOpenPlayersInsights,
  onOpenGamesInsights,
  onOpenPerformanceInsights,
  onOpenAbilitiesInsights,
  onOpenVideoInsights,
  onImportGames,
}) {
  const { openCreate } = useCreateModal()

  const actions = React.useMemo(() => {
    const baseActions = buildFabActions({
      area: 'team',
      mode: tab,
      taskContext,
      permissions: { allowCreate: true },
      handlers: {
        onAddGame: () => {
          openCreate('game', presetForTab('games', entity, context), {
            team: entity,
            ...(context || {}),
          })
        },
        onAddGames: () => {
          openCreate('games', presetForTab('games', entity, context), {
            team: entity,
            ...(context || {}),
          })
        },
        onImportGames: () => {
          if (typeof onImportGames !== 'function') return
          onImportGames()
        },
        onCreatePlayer: () => {
          openCreate('player', presetForTab('players', entity, context), {
            team: entity,
            ...(context || {}),
          })
        },
        onCreatePlayers: () => {
          openCreate('players', presetForTab('players', entity, context), {
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

        onOpenPlayersInsights: () => {
          if (playersInsightsStatus !== 'ready') return

          onOpenPlayersInsights?.()
        },
        onOpenGamesInsights: () => onOpenGamesInsights?.(),
        onOpenPerformanceInsights: () => onOpenPerformanceInsights?.(),
        onOpenAbilitiesInsights: () => onOpenAbilitiesInsights?.(),
        onOpenVideoInsights: () => onOpenVideoInsights?.(),
      },
    })

    return baseActions.map(action => (
      decoratePlayersInsightsAction({
        action,
        status: playersInsightsStatus,
      })
    ))
  }, [
    tab,
    openCreate,
    entity,
    context,
    taskContext,
    playersInsightsStatus,
    onOpenPlayersInsights,
    onOpenGamesInsights,
    onOpenPerformanceInsights,
    onOpenAbilitiesInsights,
    onOpenVideoInsights,
    onImportGames,
  ])

  if (!actions?.length) return null

  const fabEntity = FAB_ENTITY_BY_TAB[tab]
  const fabColors = fabEntity ? getEntityColors(fabEntity) : null

  return (
    <GenericFabMenu
      placement="br"
      disableTooltip
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
