// clubProfile/mobile/modules/teams/components/teamCard/ClubTeamCardHeader.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { cardSx as sx } from '../../sx/card.mobile.sx.js'

export default function ClubTeamCardHeader({ row, onOpenTeam }) {
  const clickableProfile = typeof onOpenTeam === 'function'

  return (
    <Box sx={sx.header}>
      <Box sx={{ display: 'grid', gap: 0.35, minWidth: 0 }}>
        <Box sx={sx.titleRow}>
          <Typography
            level="title-sm"
            sx={sx.title}
            title={row?.teamName}
            onClick={
              clickableProfile
                ? (e) => {
                    e.stopPropagation()
                    onOpenTeam(row?.team || row)
                  }
                : undefined
            }
          >
            {row?.teamName || '—'}
          </Typography>

          <Chip
            size="sm"
            variant="soft"
            color={row?.active ? 'success' : 'danger'}
            startDecorator={iconUi({ id: row?.active ? 'active' : 'close' })}
            sx={sx.chip}
          >
            {row?.active ? 'פעילה' : 'לא פעילה'}
          </Chip>
        </Box>

        <Box sx={sx.metaInline}>
          <Typography level="body-xs" sx={sx.subtitle}>
            {row?.teamYear || 'ללא שנתון'}
          </Typography>

          {!!row?.league && (
            <Typography level="body-xs" sx={sx.subtitle}>
              {row.league}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}
