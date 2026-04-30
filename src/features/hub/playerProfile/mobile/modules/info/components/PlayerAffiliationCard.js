// playerProfile/mobile/modules/info/components/PlayerAffiliationCard.js

import React from 'react'
import { Box, Typography, Sheet } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { infoModuleSx as sx } from '../info.module.sx.js'

import { ClubSelectField, TeamSelectField } from '../../../../../../../ui/fields'

export default function PlayerAffiliationCard({
  draft,
  pending,
  clubsOptions = [],
  teamsOptions = [],
}) {
  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography level="title-md" noWrap startDecorator={iconUi({ id: 'club' })}>
          שיוך שחקן
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.875, minWidth: 0 }}>
        <Box sx={sx.gridAff}>
          <Box sx={{ minWidth: 0 }}>
            <ClubSelectField
              value={draft?.clubId || ''}
              options={clubsOptions}
              disabled
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <TeamSelectField
              value={draft?.teamId || ''}
              options={teamsOptions}
              clubId={draft?.clubId || ''}
              disabled
              chip={false}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
