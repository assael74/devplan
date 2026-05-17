// teamProfile/sharedUi/management/ManagementTabs.js

import React from 'react'
import { Box, Button, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { tabsSx as sx } from './sx/tabs.sx.js'

export const TABS = [
  {
    id: 'info',
    label: 'מידע',
    labelH: 'ניהול קבוצה כללי',
    icon: 'details',
  },
  {
    id: 'targets',
    label: 'יעדי עונה',
    labelH: 'ניהול יעדי הקבוצה',
    icon: 'targets',
  },
  {
    id: 'staff',
    label: 'צוות מקצועי',
    labelH: 'ניהול הצוות המקצועי של הקבוצה',
    icon: 'staff',
  },
]

export default function ManagementTabs({
  activeTab,
  onTabChange,
  isMobile = false,
}) {
  return (
    <Box sx={sx.tabsShell(isMobile)}>
      {TABS.map((tab) => {
        const selected = activeTab?.id === tab.id

        return (
          <Button
            key={tab.id}
            variant="plain"
            color="neutral"
            onClick={() => onTabChange(tab)}
            sx={sx.tabBtn(selected, isMobile)}
          >
            <Box sx={sx.tabIcon(selected, isMobile)}>
              {iconUi({ id: tab.icon, })}
            </Box>

            <Box sx={sx.tabText(isMobile)}>
              <Typography
                level="title-sm"
                sx={sx.tabLabel(selected, isMobile)}
              >
                {tab.label}
              </Typography>

              {!isMobile && (
                <Typography level="body-xs" sx={sx.tabSub(selected)}>
                  {tab.labelH}
                </Typography>
              )}
            </Box>
          </Button>
        )
      })}
    </Box>
  )
}
