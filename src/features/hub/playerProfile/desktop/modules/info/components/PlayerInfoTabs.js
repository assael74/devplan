import React from 'react'
import { Box, Button, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { tabsSx as sx } from './sx/tabs.sx.js'

const LABELS = {
  details: '\u05e4\u05e8\u05d8\u05d9\u05dd',
  detailsH: '\u05de\u05d9\u05d3\u05e2 \u05d0\u05d9\u05e9\u05d9 \u05d5\u05db\u05dc\u05dc\u05d9 \u05e9\u05dc \u05d4\u05e9\u05d7\u05e7\u05df',
  position: '\u05e2\u05de\u05d3\u05d4',
  positionH: '\u05e0\u05d9\u05d4\u05d5\u05dc \u05e2\u05de\u05d3\u05d5\u05ea \u05d5\u05ea\u05e4\u05e7\u05d9\u05d3 \u05de\u05e7\u05e6\u05d5\u05e2\u05d9',
  targets: '\u05d9\u05e2\u05d3\u05d9\u05dd \u05d0\u05d9\u05e9\u05d9\u05d9\u05dd',
  targetsH: '\u05d9\u05e2\u05d3\u05d9\u05dd \u05dc\u05e4\u05d9 \u05e2\u05de\u05d3\u05d4, \u05de\u05e2\u05de\u05d3 \u05d5\u05d9\u05e2\u05d3 \u05e7\u05d1\u05d5\u05e6\u05d4',
}

export const PLAYER_INFO_TABS = [
  { id: 'details', label: LABELS.details, labelH: LABELS.detailsH, icon: 'details' },
  { id: 'position', label: LABELS.position, labelH: LABELS.positionH, icon: 'position' },
  { id: 'targets', label: LABELS.targets, labelH: LABELS.targetsH, icon: 'targets' },
]

export default function PlayerInfoTabs({ activeTab, onTabChange }) {
  return (
    <Box sx={sx.tabsShell}>
      {PLAYER_INFO_TABS.map((tab) => {
        const selected = activeTab?.id === tab.id

        return (
          <Button
            key={tab.id}
            variant='plain'
            color='neutral'
            onClick={() => onTabChange(tab)}
            sx={sx.tabBtn(selected)}
          >
            <Box sx={sx.tabIcon(selected)}>
              {iconUi({ id: tab.icon })}
            </Box>

            <Box sx={sx.tabText}>
              <Typography level='title-sm' sx={sx.tabLabel(selected)}>
                {tab.label}
              </Typography>
            </Box>
          </Button>
        )
      })}
    </Box>
  )
}
