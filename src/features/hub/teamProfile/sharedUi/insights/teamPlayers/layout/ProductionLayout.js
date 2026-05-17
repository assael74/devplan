// teamProfile/sharedUi/insights/teamPlayers/layout/ProductionLayout.js


import React from 'react'
import { Box } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { prodSx as sx } from './sx/prod.sx'

const hasValue = value => {
  return typeof value === 'string' && value.trim()
}

export default function ProductionLayout({ model = {} }) {
  return (
    <Box sx={sx.subSection}>

    </Box>
  )
}
