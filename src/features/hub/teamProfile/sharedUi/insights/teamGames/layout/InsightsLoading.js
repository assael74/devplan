// teamProfile/sharedUi/insights/teamGames/layout/InsightsLoading.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  LocalInsightsSection,
} from '../../../../../../../ui/patterns/insights/index.js'

import LocalHeader from './LocalHeader.js'

function LoadingBlock({ height = 120 }) {
  return (
    <Box
      sx={{
        height,
        borderRadius: 'xl',
        bgcolor: 'background.level1',
      }}
    />
  )
}

export default function InsightsLoading({
  model,
  calculationMode,
  onCalculationModeChange,
  liveTeam,
}) {
  return (
    <LocalInsightsSection
      title="תחזית סיום"
      icon="projection"
      action={(
        <LocalHeader
          model={model}
          calculationMode={calculationMode}
          onCalculationModeChange={onCalculationModeChange}
          liveTeam={liveTeam}
        />
      )}
    >
      <Box sx={{ display: 'grid', gap: 1.5 }}>
        <LoadingBlock height={44} />
        <LoadingBlock height={132} />
        <LoadingBlock height={180} />
      </Box>
    </LocalInsightsSection>
  )
}
