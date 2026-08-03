// features/hub/components/desktop/HubRootDesktop.js

import React from 'react'
import { Sheet } from '@mui/joy'

import HubToolbar from './navigation/HubToolbar'
import HubDesktopLayout from './layout/HubDesktopLayout.js'
import HubFabMenu from '../../sharedProfile/HubFabMenu.js'
import HubListPanel from '../lists/HubListPanel.js'

export default function HubRootDesktop({
  mode,
  title,
  subtitle,
  onModeChange,
  counts,
  tabsMeta,
  list,
  control,
  handlers,
  context,
  taskContext,
  permissions,
}) {
  const listPanel = (
    <HubListPanel
      mode={mode}
      onModeChange={onModeChange}
      counts={counts}
      tabsMeta={tabsMeta}
    >
      {list}
    </HubListPanel>
  )

  return (
    <Sheet
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
        bgcolor: 'background.body',
        px: 1,
      }}
    >
      <HubToolbar title={title} subtitle={subtitle} />

      <HubDesktopLayout list={listPanel} control={control} />

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
