// ui/forms/ui/teams/TeamCreateFields.js

import React from 'react'
import { Box, Typography, Divider } from '@mui/joy'

import TeamNameField from '../../../fields/inputUi/teams/TeamNameField.js'
import ClubSelectField from '../../../fields/selectUi/clubs/ClubSelectField.js'
import YearPicker from '../../../fields/dateUi/YearPicker.js'
import TeamProjectSelector from '../../../fields/checkUi/teams/TeamProjectSelector.js'
import TeamIfaLinkField from '../../../fields/inputUi/teams/TeamIfaLinkField.js'

import { createSx as sx } from './sx/create.sx.js'

const clean = (v) => String(v ?? '').trim()

export default function TeamCreateFields({
  draft = {},
  onDraft,
  context = {},
  validity = {},
  layout,
}) {
  const clubId = draft?.clubId || ''
  const clubs = context?.clubs || []
  const contextClubId = context?.club?.id || context?.club?.clubId || ''
  const isClubLocked = !!contextClubId

  return (
    <Box sx={sx.root(layout)}>
      <Box sx={sx.block(layout.topCols, 1)}>
        <Box sx={{ minWidth: 0 }}>
          <TeamNameField
            required
            value={draft?.teamName || ''}
            onChange={(value) => onDraft({ ...draft, teamName: value || '' })}
            size="sm"
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <ClubSelectField
            required
            value={clubId}
            options={clubs}
            onChange={(value) => {
              const nextClubId = value || ''
              onDraft({
                ...draft,
                clubId: nextClubId,
                teamId: '',
              })
            }}
            disabled={isClubLocked}
            error={!validity?.okClub && clean(clubId).length > 0}
            size="sm"
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <YearPicker
            label="שנתון"
            value={draft?.teamYear || ''}
            onChange={(value) => onDraft({ ...draft, teamYear: value || '' })}
            required
            clearable={false}
            range={{ past: 20, future: 0 }}
            size="sm"
          />
        </Box>
      </Box>

      <Divider>
        <Typography level="title-sm" sx={sx.title}>
          כללי
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.metaCols, 1)}>
        <Box sx={{ minWidth: 0 }}>
          <TeamIfaLinkField
            value={draft?.ifaLink || ''}
            onChange={(value) => onDraft({ ...draft, ifaLink: value || '' })}
            size="sm"
          />
        </Box>

        <Box sx={sx.status}>
          <TeamProjectSelector
            value={draft?.project === true}
            onChange={(value) => onDraft({ ...draft, project: value === true })}
            size="sm"
          />
        </Box>
      </Box>
    </Box>
  )
}
