// src/features/hub/components/HubToolbar.js
import React from 'react'
import { Tabs, TabList, Tab, Sheet, Typography, Box, Input } from '@mui/joy'
import { hubPageSx as sx} from '../../ui/hubPage.sx.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'

export default function HubToolbar({
  mode,
  onModeChange,
  counts = {},
  tabsMeta = [],
  query = '',
  onQueryChange,
}) {
  return (
    <Sheet
      variant="soft"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        px: 1.5,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 'sm',
      }}
    >
      <Typography level="h3" startDecorator={iconUi({id: 'dashboard'})}>מרכז שליטה</Typography>

      <Tabs value={mode} onChange={(e, v) => onModeChange(v)} sx={{ mt: 1 }}>
        <TabList disableUnderline sx={sx.headerTabs(mode)}>
          {tabsMeta.map((t) => {
            const count = counts[t.value]
            return (
              <Tab key={t.value} value={t.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {t.icon}
                  <span>
                    {t.label}
                    {typeof count === 'number' ? ` (${count})` : ''}
                  </span>
                </Box>
              </Tab>
            )
          })}
        </TabList>
      </Tabs>


    </Sheet>
  )
}
