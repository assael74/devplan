// teamProfile/sharedUi/insights/teamPlayers/sections/PositionsSection.js

import React, { useState } from 'react'
import { Box } from '@mui/joy'

import {
  LocalInsightsSection,
} from '../../../../../../../ui/patterns/insights/index.js'

import {
  PositionCards,
} from '../buildSection/index.js'

import { sectionsSx as sx } from './sx/sections.sx.js'

export default function PositionsSection({
  primaryCards = [],
  coverageCards = [],
}) {
  const [mode, setMode] = useState('primary')

  const cards = mode === 'coverage'
    ? coverageCards
    : primaryCards

  return (
    <LocalInsightsSection
      title="פריסה לפי עמדות"
      sub={
        mode === 'coverage'
          ? 'כיסוי כל עמדה לפי כל העמדות שהשחקנים יכולים לשחק בהן'
          : 'כיסוי כל עמדה לפי עמדה ראשית בלבד'
      }
      icon="position"
    >
      <Box sx={sx.block}>
        <Box sx={sx.sectionHead}>
          <Box />

        </Box>

        <PositionCards cards={cards} />
      </Box>
    </LocalInsightsSection>
  )
}
