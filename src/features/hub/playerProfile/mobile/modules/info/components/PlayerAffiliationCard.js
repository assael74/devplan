// features/hub/playerProfile/mobile/modules/info/components/PlayerAffiliationCard.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import PlayerAffiliationFields from '../../../../../../../ui/forms/players/edit/PlayerAffiliationFields.js'

import { infoModuleSx as sx } from '../info.module.sx.js'

export default function PlayerAffiliationCard({
  player,
  draft,
  setDraft,
  pending = false,
  clubsOptions = [],
  teamsOptions = [],
}) {
  const isPrivatePlayer =
    player?.isPrivatePlayer === true ||
    player?.playerSource === 'private'

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography
          level="title-md"
          noWrap
          startDecorator={iconUi({ id: 'club' })}
        >
          שיוך שחקן
        </Typography>
      </Box>

      <PlayerAffiliationFields
        draft={draft}
        onDraft={setDraft}
        clubsOptions={clubsOptions}
        teamsOptions={teamsOptions}
        layout={sx.gridAff}
        disabled={pending || !isPrivatePlayer}
        hideTeam={false}
        freeText={isPrivatePlayer}
      />
    </Sheet>
  )
}
