// features/home/TaskFab.js

import React from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useMediaQuery } from '@mui/material'

import GenericFabMenu from '../../ui/actions/GenericFabMenu.js'
import { buildFabActions } from '../../ui/actions/fabActions.factory.js'
import { buildTaskFabContext } from '../../ui/actions/buildTaskFabContext.js'
import { useCreateModal } from '../../ui/forms/create/CreateModalProvider.js'
import { buildTaskPresetDraft } from '../../ui/forms/helpers/tasksForm.helpers.js'
import { getEntityColors } from '../../ui/core/theme/Colors.js'

function resolveHomeTaskWorkspace(homeView, workspace) {
  if (homeView === 'workspace' && workspace === 'analyst') return 'analyst'
  if (homeView === 'workspace' && workspace === 'app') return 'app'
  if (homeView === 'inProgress') return ''
  return 'app'
}

export default function TaskFab() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isMobile = useMediaQuery('(max-width: 899px)')

  const { openCreate } = useCreateModal()

  const homeView = searchParams.get('homeView') || ''
  const workspace = searchParams.get('workspace') || ''

  const taskContext = React.useMemo(() => {
    return buildTaskFabContext({
      location,
      area: 'home',
      mode: homeView || 'entry',
      extra: {
        workspace: resolveHomeTaskWorkspace(homeView, workspace),
        homeView,
        workspace,
      },
    })
  }, [location, homeView, workspace])

  const actions = React.useMemo(() => {
    return buildFabActions({
      area: 'home',
      mode: homeView || 'entry',
      taskContext,
      permissions: { allowCreate: true },
      handlers: {
        onAddTask: (taskCtx = {}) => {
          const draft = buildTaskPresetDraft(taskCtx)

          openCreate(
            'task',
            draft,
            taskCtx,
            {
              surface: 'drawer',
              drawerAnchor: isMobile ? 'bottom' : 'right',
              drawerWidth: 900,
            }
          )
        },
      },
    })
  }, [homeView, taskContext, openCreate, isMobile])

  if (!actions?.length) return null

  const colors = getEntityColors('taskApp')

  return (
    <GenericFabMenu
      placement="br"
      actions={actions}
      color="neutral"
      fabSx={{
        bgcolor: colors.accent,
        color: colors.textAcc || '#fff',
        '&:hover': {
          bgcolor: colors.accent,
          filter: 'brightness(0.95)',
        },
        '&:active': {
          filter: 'brightness(0.9)',
        },
      }}
    />
  )
}
