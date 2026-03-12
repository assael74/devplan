// preview/previewDomainCard/domains/player/info/components/PlayerInfoTopSection.js

import React from 'react'
import { Box, Divider, Typography } from '@mui/joy'

import {
  PlayerFirstNameField,
  PlayerLastNameField,
  PlayerShortNameField,
  PlayerActiveSelector,
  PlayerKeyPlayerSelector,
} from '../../../../../../../../../ui/fields'

import { sx } from '../sx/playerInfo.domain.sx.js'

export default function PlayerInfoTopSection({ form, pending, setField }) {
  return (
    <>
      <Box sx={sx.topTitlesGrid}>
        <Typography level="title-sm" sx={sx.sectionTitle}>
          פרטים בסיסיים
        </Typography>

        <Typography level="body-sm" sx={sx.statusTitle}>
          סטטוסים
        </Typography>
      </Box>

      <Box sx={sx.topGrid}>
        <Box sx={sx.namesGrid}>
          <PlayerFirstNameField
            value={form.playerFirstName}
            onChange={(v) => setField('playerFirstName', v)}
            disabled={pending}
          />

          <PlayerLastNameField
            value={form.playerLastName}
            onChange={(v) => setField('playerLastName', v)}
            disabled={pending}
          />

          <PlayerShortNameField
            value={form.playerShortName}
            onChange={(v) => setField('playerShortName', v)}
            disabled={pending}
          />
        </Box>

        <Divider orientation="vertical" sx={sx.topDivider} />

        <Box sx={sx.statusCard}>
          <Box sx={sx.statusChipsRow}>
            <PlayerActiveSelector
              value={!!form.active}
              onChange={(v) => setField('active', !!v)}
              size="sm"
              disabled={pending}
            />

            <PlayerKeyPlayerSelector
              value={!!form.isKey}
              onChange={(v) => setField('isKey', !!v)}
              size="sm"
              disabled={pending}
            />
          </Box>
        </Box>
      </Box>

      <Divider sx={sx.divider} />
    </>
  )
}
