// teamProfile/sharedUi/insights/teamGames/layout/LocalHeader.js

import React from 'react'
import { Box } from '@mui/joy'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import { ReportPrintButton } from '../../../../../../../ui/patterns/reportPrint/index.js'

import {
  buildTeamGamesInsightsPrintModel,
} from '../../../../sharedLogic/games/insightsLogic/index.js'

import { CalculationModeChips } from '../controls/index.js'
import { TeamGamesInsightsPrintView } from '../print/index.js'

const buildDocumentTitle = (team) => {
  const teamName =
    team?.teamName ||
    team?.name ||
    ''

  return `דוח תובנות משחקי קבוצה - ${teamName}`
}

export default function LocalHeader({
  model,
  calculationMode,
  onCalculationModeChange,
  liveTeam,
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        flexWrap: 'nowrap',
        justifyContent: 'flex-end',
        minWidth: 0,
      }}
    >
      <CalculationModeChips
        value={calculationMode}
        onChange={onCalculationModeChange}
      />

      <ReportPrintButton
        iconOnly={isMobile}
        label="הדפס / PDF"
        variant={isMobile ? 'soft' : 'outlined'}
        tooltip="הדפס / שמור PDF"
        documentTitle={buildDocumentTitle(liveTeam)}
        sx={{
          minHeight: 32,
          height: 32,
          minWidth: 32,
          width: isMobile ? 32 : 'auto',
          px: isMobile ? 0 : 1.25,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 'lg',
          fontWeight: 600,
          '--Button-gap': '0.35rem',
        }}
        renderContent={() => (
          <TeamGamesInsightsPrintView
            model={buildTeamGamesInsightsPrintModel({ model })}
          />
        )}
      />
    </Box>
  )
}
