// videoHub/components/desktop/VideoTabsHeader.js

import React from 'react'
import { Box, TabList, Tabs, Tab, Typography, ListItemDecorator, Sheet } from '@mui/joy'
import { VIDEO_TAB } from '../../logic/videoHub.model'
import { videoTabSx as sx } from './tab.sx'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'

export default function VideoTabsHeader({ tab, onTab }) {
  const idColor = tab === VIDEO_TAB.GENERAL ? 'videoGeneral' : 'videoAnalysis'
  return (
    <Sheet variant="soft" sx={sx.headerSheet}>
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, }}>
        <Typography level="h3" noWrap startDecorator={iconUi({ id: 'videos' })}>
          מרכז וידאו
        </Typography>
      </Box>

      <Tabs aria-label="tabs" value={tab} onChange={(e, v) => onTab(v)} sx={{ bgcolor: 'transparent' }}>
        <TabList disableUnderline sx={sx.headerTabs}>
          <Tab value={VIDEO_TAB.GENERAL}>
            <ListItemDecorator>{iconUi({ id: 'videoGeneral' })}</ListItemDecorator>
            וידאו כללי
          </Tab>
          <Tab value={VIDEO_TAB.ANALYSIS}>
            <ListItemDecorator>{iconUi({ id: 'videoAnalysis' })}</ListItemDecorator>
            ניתוחי וידאו
          </Tab>
        </TabList>
      </Tabs>
    </Sheet>
  )
}
