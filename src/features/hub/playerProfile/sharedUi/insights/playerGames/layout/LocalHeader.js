// playerProfile/sharedUi/insights/playerGames/layout/LocalHeader.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import {
  ReportPrintButton,
} from '../../../../../../../ui/patterns/reportPrint/index.js'

import {
  buildPlayerGamesInsightsPrintModel,
} from '../../../../sharedLogic/games/insightsDrawer/index.js'

import {
  PlayerGamesInsightsPrintView,
} from '../print/index.js'

const buildPlayerReportTitle = ({ player, team }) => {
  const playerName =
    player?.playerFullName ||
    player?.name ||
    'שחקן'

  const teamName =
    team?.teamName ||
    team?.name ||
    ''

  return teamName
    ? `דוח תובנות שחקן - ${playerName} | ${teamName}`
    : `דוח תובנות שחקן - ${playerName}`
}

const HeaderActions = ({
  model,
  disabled = false,
}) => {
  const livePlayer = model?.livePlayer || {}
  const liveTeam = model?.liveTeam || {}

  return (
    <ReportPrintButton
      label="הדפס / PDF"
      tooltip="הדפס / שמור PDF"
      documentTitle={buildPlayerReportTitle({
        player: livePlayer,
        team: liveTeam,
      })}
      disabled={disabled}
      size="sm"
      variant="soft"
      color="neutral"
      renderContent={() => (
        <PlayerGamesInsightsPrintView
          model={buildPlayerGamesInsightsPrintModel(model)}
        />
      )}
    />
  )
}

export default function LocalHeader({
  title = 'תובנות משחקי שחקן',
  subtitle = 'אבחון שימוש, תפוקה והשפעה לפי משחקים',
  model = null,
  actions = null,
  showPrint = true,
  printDisabled = false,
  sx = {},
}) {
  const resolvedActions = actions || (
    showPrint && model ? (
      <HeaderActions
        model={model}
        disabled={printDisabled}
      />
    ) : null
  )

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1.5,
        minWidth: 0,
        px: 0.25,
        ...sx,
      }}
    >
      <Box
        sx={{
          minWidth: 0,
          display: 'grid',
          gap: 0.25,
        }}
      >
        {!!title && (
          <Typography
            level="title-sm"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1.25,
            }}
          >
            {title}
          </Typography>
        )}

        {!!subtitle && (
          <Typography
            level="body-xs"
            sx={{
              color: 'text.tertiary',
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {!!resolvedActions && (
        <Box
          sx={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 0.75,
            pt: 0.1,
          }}
        >
          {resolvedActions}
        </Box>
      )}
    </Box>
  )
}
