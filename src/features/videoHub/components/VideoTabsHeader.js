// src/features/videoHub/components/VideoTabsHeader.js
import React from 'react'
import { Box, TabList, Tabs, Tab, Typography, ListItemDecorator, Sheet } from '@mui/joy'
import { VIDEO_TAB } from '../videoHub.model'
import { videoComponentsSx as sx } from './components.sx'
import { iconUi } from '../../../ui/core/icons/iconUi.js'

export default function VideoTabsHeader({ tab, onTab }) {
  const idColor = tab === VIDEO_TAB.GENERAL ? 'videoGeneral' : 'videoAnalysis'
  return (
    <Sheet variant="soft" sx={sx.headerSheet}>
      <Box sx={sx.headerTitleRow}>
        <Typography level="h3" noWrap startDecorator={iconUi({ id: 'videos' })}>
          מרכז וידאו
        </Typography>
      </Box>

      <Tabs aria-label="tabs" value={tab} onChange={(e, v) => onTab(v)} sx={sx.headerTabsRoot}>
        <TabList disableUnderline sx={sx.headerTabs(idColor)}>
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
