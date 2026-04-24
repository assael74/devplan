// clubProfile/mobile/modules/teams/components/teamCard/ClubTeamCardSummary.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { cardSx as sx } from '../../sx/card.mobile.sx.js'

export default function ClubTeamCardSummary({ row }) {
  return (
    <Box sx={sx.playerStatsWrap}>
      <Chip
        size="sm"
        variant="soft"
        color="primary"
        startDecorator={iconUi({ id: 'players' })}
        sx={sx.chip}
      >
        {row?.playersCount ?? 0} שחקנים
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color="warning"
        startDecorator={iconUi({ id: 'keyPlayer' })}
        sx={sx.chip}
      >
        {row?.keyPlayersCount ?? 0} מפתח
      </Chip>

      {row?.isProject && (
        <Chip
          size="sm"
          variant="soft"
          color="success"
          startDecorator={iconUi({ id: 'project' })}
          sx={sx.chip}
        >
          פרויקט
        </Chip>
      )}

      {row?.points != null && (
        <Chip
          size="sm"
          variant="soft"
          color="neutral"
          startDecorator={iconUi({ id: 'score' })}
          sx={sx.chip}
        >
          {row.points} נק׳
        </Chip>
      )}
    </Box>
  )
}
