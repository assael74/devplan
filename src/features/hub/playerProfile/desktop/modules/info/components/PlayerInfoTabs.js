import React from 'react'
import { Box, Button, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { tabsSx as sx } from './sx/tabs.sx.js'

export const PLAYER_INFO_TABS = [
  {
    id: 'details',
    label: 'פרטים',
    labelH: 'מידע אישי וכללי של השחקן',
    icon: 'details',
  },
  {
    id: 'position',
    label: 'עמדה',
    labelH: 'ניהול עמדות ותפקיד מקצועי',
    icon: 'position',
  },
  {
    id: 'targets',
    label: 'יעדים אישיים',
    labelH: 'יעדים לפי עמדה, מעמד ויעד קבוצה',
    icon: 'targets',
  },
]

export default function PlayerInfoTabs({ activeTab, onTabChange }) {
  return (
    <Box sx={sx.tabsShell}>
      {PLAYER_INFO_TABS.map((tab) => {
        const selected = activeTab?.id === tab.id

        return (
          <Button
            key={tab.id}
            variant="plain"
            color="neutral"
            onClick={() => onTabChange(tab)}
            sx={sx.tabBtn(selected)}
          >
            <Box sx={sx.tabIcon(selected)}>
              {iconUi({ id: tab.icon })}
            </Box>

            <Box sx={sx.tabText}>
              <Typography level="title-sm" sx={sx.tabLabel(selected)}>
                {tab.label}
              </Typography>

              <Typography level="body-xs" sx={sx.tabSub(selected)}>
                {tab.labelH}
              </Typography>
            </Box>
          </Button>
        )
      })}
    </Box>
  )
}
