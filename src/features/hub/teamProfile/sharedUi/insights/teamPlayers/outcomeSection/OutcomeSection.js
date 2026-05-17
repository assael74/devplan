// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/OutcomeSection.js

import React from 'react'
import { Box } from '@mui/joy'

import OutcomeBlock from './OutcomeBlock.js'

import { sectionSx as sx } from './sx/index.js'

const emptyObject = {}

export default function OutcomeSection({ model = emptyObject }) {
  const aspects = model?.aspects || emptyObject

  return (
    <Box sx={sx.subSection}>
      <OutcomeBlock
        model={aspects.role}
        hideGroupIds={['none']}
        infoGroupIds={['none']}
      />

      <OutcomeBlock
        model={aspects.position}
        separated
      />
    </Box>
  )
}
