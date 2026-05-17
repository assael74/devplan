// teamProfile/sharedUi/insights/teamPlayers/layout/ActionItemsLayout.js

import React from 'react'
import { Box } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { actionSx as sx } from './sx/action.sx'

const hasValue = value => {
  return typeof value === 'string' && value.trim()
}

export default function ActionItemsLayout({ model = {} }) {
  return (
    <Box sx={sx.subSection}>

    </Box>
  )
}
