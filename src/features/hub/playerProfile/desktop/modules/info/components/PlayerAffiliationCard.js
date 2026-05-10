// playerProfile/desktop/modules/info/components/PlayerAffiliationCard.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { sharedSx as sx } from './sx/shared.sx.js'

import { ClubSelectField, TeamSelectField } from '../../../../../../../ui/fields'

import {
  buildAffiliationInitial,
  isAffiliationDirty,
} from '../../../../../../../shared/players/players.logic.js'

const toStr = (v) => (v == null ? '' : String(v))

export default function PlayerAffiliationCard({ draft, setDraft, pending, clubsOptions = [], teamsOptions = [] }) {
  const hasClub = Boolean(draft.clubId)
  const hasTeam = Boolean(draft.teamId)

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          {iconUi({ id: 'club', size: 'sm' }) || iconUi?.({ id: 'team', size: 'sm' }) || null}
          <Typography level="title-md" noWrap>
            שיוך
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Chip size="sm" variant="soft" color={hasClub ? 'primary' : 'neutral'}>
            מועדון
          </Chip>
          <Chip size="sm" variant="soft" color={hasTeam ? 'primary' : 'neutral'}>
            קבוצה
          </Chip>
        </Box>
      </Box>

      <Box sx={sx.formGrid2}>
        <ClubSelectField
          value={draft.clubId}
          options={clubsOptions}
          disabled={true}
        />

          <TeamSelectField
            value={draft.teamId}
            options={teamsOptions}
            clubId={draft.clubId}
            disabled={true}
          />
      </Box>
    </Sheet>
  )
}
