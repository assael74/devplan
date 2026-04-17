// features/hub/components/desktop/HubRootDesktop.js

import React from 'react'
import { Sheet } from '@mui/joy'

import HubToolbar from './navigation/HubToolbar'
import PlayersLayout from './layout/PlayersLayout'
import HubFabMenu from './navigation/HubFabMenu'

export default function HubRootDesktop({
  mode,
  onModeChange,
  query,
  onQueryChange,
  counts,
  tabsMeta,
  list,
  preview,
  handlers,
  context,
  taskContext,
  permissions,
}) {
  return (
    <Sheet sx={{ height: '100%', bgcolor: 'background.body', px: 1 }}>
      <HubToolbar
        mode={mode}
        onModeChange={onModeChange}
        query={query}
        onQueryChange={onQueryChange}
        counts={counts}
        tabsMeta={tabsMeta}
      />

      <PlayersLayout list={list} preview={preview} />

      <HubFabMenu
        mode={mode}
        handlers={handlers}
        context={context}
        taskContext={taskContext}
        permissions={permissions}
      />
    </Sheet>
  )
}
