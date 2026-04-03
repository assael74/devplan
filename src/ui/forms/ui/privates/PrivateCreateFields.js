// ui/forms/ui/privates/PrivateCreateFields.js

import React, { useEffect } from 'react'
import { Box, Typography, Divider, Chip } from '@mui/joy'

import PlayerFirstNameField from '../../../fields/inputUi/players/PlayerFirstNameField'
import PlayerLastNameField from '../../../fields/inputUi/players/PlayerLastNameField'
import TeamNameField from '../../../fields/inputUi/teams/TeamNameField'
import ClubNameField from '../../../fields/inputUi/clubs/ClubNameField'
import MonthYearPicker from '../../../fields/dateUi/MonthYearPicker'

import { pcfSx } from '../../sx/playerCreateForm.sx.js'

const clean = (v) => String(v ?? '').trim()

export default function PrivateCreateFields({
  draft,
  onDraft,
  context,
  validity,
  layout,
}) {
  const playerFirstName = draft?.playerFirstName || ''
  const playerLastName = draft?.playerLastName || ''
  const clubName = draft?.clubName || ''
  const teamName = draft?.teamName || ''
  const birth = draft?.birth || ''

  return (
    <Box sx={pcfSx.root(layout)}>
      <Box sx={pcfSx.block(layout.topCols, 1)}>
        <PlayerFirstNameField
          required
          value={playerFirstName}
          onChange={(v) => onDraft({ ...draft, playerFirstName: v })}
          error={!validity.okFirst && clean(playerFirstName).length > 0}
          size="sm"
        />

        <PlayerLastNameField
          required
          value={playerLastName}
          onChange={(v) => onDraft({ ...draft, playerLastName: v })}
          error={!validity.okLast && clean(playerLastName).length > 0}
          size="sm"
        />
      </Box>

      <Divider>
        <Typography level="title-sm" sx={pcfSx.title}>
          שיוך למועדון וקבוצה
        </Typography>
      </Divider>

      <Box sx={pcfSx.block(layout.mainCols, 2)}>
        <ClubNameField
          required
          value={clubName}
          onChange={(v) => onDraft({ ...draft, clubName: v })}
          error={!validity.okClub && clean(clubName).length > 0}
          size="sm"
        />

        <TeamNameField
          required
          value={teamName}
          onChange={(v) => onDraft({ ...draft, teamName: v })}
          error={!validity.okTeam && clean(teamName).length > 0}
          size="sm"
        />
      </Box>

      <Divider>
        <Typography level="title-sm" sx={pcfSx.title}>
          שנתון
        </Typography>
      </Divider>

      <Box sx={pcfSx.block(layout.metaCols, 1)}>
        <MonthYearPicker
          required
          label='שנתון'
          value={birth}
          onChange={(v) => onDraft({ ...draft, birth: v })}
          size="sm"
          error={!validity.okBirth && clean(birth).length > 0}
        />
      </Box>
    </Box>
  )
}
