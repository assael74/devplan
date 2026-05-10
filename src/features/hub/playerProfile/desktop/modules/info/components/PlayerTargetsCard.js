// playerProfile/desktop/modules/info/components/PlayerTargetsCard.js

import React, { useMemo } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import {
  buildPlayerTargetsState,
} from '../../../../../../../shared/players/targets/index.js'

import {
  buildPlayerTargetsViewModel,
} from '../../../../sharedLogic/info'

import PlayerTargetsView from '../../../../sharedUi/info/PlayerTargetsView.js'

import { targetsSx as sx } from './sx/targets.sx.js'

const ActualMetric = ({ label, value, id }) => {
  return (
    <Sheet variant="soft" color="neutral" sx={sx.actualMetric(id)}>
      <Typography level="body-xs" sx={sx.actualMetricLabel}>
        {label}
      </Typography>

      <Typography level="title-md" sx={sx.actualMetricValue}>
        {value}
      </Typography>
    </Sheet>
  )
}

const ActualBlock = ({ title, items = [], id }) => {
  if (!items.length) return null

  return (
    <Box sx={sx.actualBlock}>
      {items.map((item) => (
        <ActualMetric
          key={item.id}
          id={id}
          label={item.label}
          value={item.value}
        />
      ))}
    </Box>
  )
}

export default function PlayerTargetsCard({
  player,
  team,
  draft,
}) {
  const livePlayer = useMemo(() => {
    return {
      ...(player || {}),
      ...(draft || {}),
    }
  }, [player, draft])

  const activeTeam = team || livePlayer?.team || {}

  const targets = useMemo(() => {
    return buildPlayerTargetsState({
      player: livePlayer,
      team: activeTeam,
    })
  }, [livePlayer, activeTeam])

  const viewModel = useMemo(() => {
    return buildPlayerTargetsViewModel({
      player: livePlayer,
      team: activeTeam,
      targets,
    })
  }, [livePlayer, activeTeam, targets])

  return (
    <Sheet variant="soft" sx={sx.card}>
      <Box sx={sx.grid}>
        <Box sx={sx.actualCol}>
          <Box sx={{ p: 1 }}>
            <Typography level="title-sm" sx={sx.actualBlockTitle}>
              ביצוע אישי נוכחי
            </Typography>

            <ActualBlock items={viewModel.actualCards.personal} id='player' />
          </Box>

          <Box sx={{ p: 1 }}>
            <Typography level="title-sm" sx={sx.actualBlockTitle}>
              ביצוע קבוצתי נוכחי
            </Typography>

            <ActualBlock items={viewModel.actualCards.team} id='team' />
          </Box>
        </Box>

        <Box sx={sx.targetsCol}>
          <PlayerTargetsView viewModel={viewModel} />
        </Box>
      </Box>
    </Sheet>
  )
}
