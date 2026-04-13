// ui/forms/ui/players/PlayerCreateFields.js

import React, { useEffect } from 'react'
import { Box, Typography, Divider, Chip } from '@mui/joy'

import PlayerFirstNameField from '../../../fields/inputUi/players/PlayerFirstNameField'
import PlayerLastNameField from '../../../fields/inputUi/players/PlayerLastNameField'
import ClubSelectField from '../../../fields/selectUi/clubs/ClubSelectField'
import TeamSelectField from '../../../fields/selectUi/teams/TeamSelectField'
import MonthYearPicker from '../../../fields/dateUi/MonthYearPicker'

import { createSx as sx } from './sx/create.sx.js'

const clean = (v) => String(v ?? '').trim()

export default function PlayerCreateFields({
  draft,
  onDraft,
  context,
  validity,
  layout,
}) {
  const playerFirstName = draft?.playerFirstName || ''
  const playerLastName = draft?.playerLastName || ''
  const clubId = draft?.clubId || ''
  const teamId = draft?.teamId || ''
  const birth = draft?.birth || ''
  const clubs = context?.clubs || []
  const teams = context?.teams || []

  return (
    <Box sx={sx.root(layout)}>
      <Box sx={sx.block(layout.topCols, 1)}>
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
        <Typography level="title-sm" sx={sx.title}>
          שיוך למועדון וקבוצה
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.mainCols, 2)}>
        <ClubSelectField
          required
          value={clubId}
          options={clubs}
          onChange={(v) => {
            const nextClubId = v || ''
            onDraft({ ...draft, clubId: nextClubId, teamId: '' })
          }}
          error={!validity.okClub && clean(clubId).length > 0}
          size="sm"
        />

        <TeamSelectField
          required
          value={teamId}
          clubId={clubId}
          options={teams}
          onChange={(v) => onDraft({ ...draft, teamId: v })}
          error={!validity.okTeam && clean(teamId).length > 0}
          size="sm"
        />
      </Box>

      <Divider>
        <Typography level="title-sm" sx={sx.title}>
          שנתון
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.metaCols, 1)}>
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
