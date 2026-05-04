// src/features/hub/teamProfile/modules/management/TeamManagementInfoCard.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import TeamLeagueNameField from '../../../../../../../ui/fields/inputUi/teams/TeamLeagueNameField'
import TeamLeagueLevelField from '../../../../../../../ui/fields/inputUi/teams/TeamLeagueLevelField'
import TeamLeagueRoundField from '../../../../../../../ui/fields/inputUi/teams/TeamLeagueRoundField'

import TeamNameField from '../../../../../../../ui/fields/inputUi/teams/TeamNameField.js'
import TeamIfaLinkField from '../../../../../../../ui/fields/inputUi/teams/TeamIfaLinkField.js'
import TeamActiveSelector from '../../../../../../../ui/fields/checkUi/teams/TeamActiveSelector.js'
import TeamProjectSelector from '../../../../../../../ui/fields/checkUi/teams/TeamProjectSelector.js'
import ClubNameField from '../../../../../../../ui/fields/inputUi/clubs/ClubNameField.js'
import YearPicker from '../../../../../../../ui/fields/dateUi/YearPicker'

import { moduleSx as sx } from '../module.sx.js'

export default function TeamManagementInfoCard({
  draft,
  clubName,
  onDraft,
  pending,
}) {
  return (
    <Sheet variant="soft" sx={sx.card}>
      <Box sx={sx.cardHeader}>
        <Typography level="title-sm" sx={{ whiteSpace: 'nowrap' }}>
          מידע קבוצה
        </Typography>
      </Box>

      <Box sx={sx.firstRow}>
        <Box sx={sx.chipsRow}>
          <TeamActiveSelector
            value={draft.active}
            onChange={(v) => onDraft({ ...draft, active: v })}
          />

          <TeamProjectSelector
            value={draft.project}
            onChange={(v) => onDraft({ ...draft, project: v })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <YearPicker
            label="שנתון"
            size="sm"
            value={draft.teamYear}
            onChange={(v) => onDraft({ ...draft, teamYear: v })}
            range={{ past: 20, future: 0 }}
          />
        </Box>
      </Box>

      <Box sx={sx.secondRow}>
        <TeamNameField
          value={draft.teamName}
          size="sm"
          onChange={(v) => onDraft({ ...draft, teamName: v })}
        />

        <ClubNameField
          value={clubName}
          onChange={() => {}}
          readOnly
          required
          disabled={false}
          helperText=""
        />
      </Box>

      <Box sx={sx.thirdRow}>
        <TeamIfaLinkField
          value={draft.ifaLink}
          onChange={(v) => onDraft({ ...draft, ifaLink: v })}
        />
      </Box>

      <Box sx={sx.forthRow}>
        <Box sx={{ minWidth: 0 }}>
          <TeamLeagueNameField
            value={draft.league || ''}
            size="sm"
            label="ליגה"
            variant="outlined"
            disabled={pending}
            onChange={(v) => onDraft({ ...draft, league: v })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <TeamLeagueLevelField
            value={draft.leagueLevel || ''}
            size="sm"
            label="רמת ליגה"
            variant="outlined"
            disabled={pending}
            onChange={(v) => onDraft({ ...draft, leagueLevel: v })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <TeamLeagueRoundField
            value={draft.leagueRound || ''}
            size="sm"
            variant="outlined"
            disabled={pending}
            max={40}
            onChange={(v) => onDraft({ ...draft, leagueRound: v })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <TeamLeagueRoundField
            value={draft.leagueNumGames || ''}
            size="sm"
            placeholder='סה"כ מחזורים"'
            label='מחזורי ליגה'
            variant="outlined"
            disabled={pending}
            max={40}
            onChange={(v) => onDraft({ ...draft, leagueNumGames: v })}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
