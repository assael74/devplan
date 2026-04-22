// teamProfile/mobile/modules/management/TeamManagementInfoCard.js

import React from 'react'
import { Box, Sheet, Typography, Chip, Divider } from '@mui/joy'

import TeamNameField from '../../../../../../../ui/fields/inputUi/teams/TeamNameField.js'
import TeamIfaLinkField from '../../../../../../../ui/fields/inputUi/teams/TeamIfaLinkField.js'
import TeamActiveSelector from '../../../../../../../ui/fields/checkUi/teams/TeamActiveSelector.js'
import TeamProjectSelector from '../../../../../../../ui/fields/checkUi/teams/TeamProjectSelector.js'
import ClubNameField from '../../../../../../../ui/fields/inputUi/clubs/ClubNameField.js'
import YearPicker from '../../../../../../../ui/fields/dateUi/YearPicker.js'

import TeamLeagueNameField from '../../../../../../../ui/fields/inputUi/teams/TeamLeagueNameField.js'
import TeamLeaguePosField from '../../../../../../../ui/fields/inputUi/teams/TeamLeaguePosField.js'
import TeamLeaguePointsField from '../../../../../../../ui/fields/inputUi/teams/TeamLeaguePointsField.js'
import TeamLeagueLevelField from '../../../../../../../ui/fields/inputUi/teams/TeamLeagueLevelField.js'
import GoalsAgainstField from '../../../../../../../ui/fields/inputUi/games/GoalsAgainstField.js'
import GoalsForField from '../../../../../../../ui/fields/inputUi/games/GoalsForField.js'

import { moduleSx as sx } from '../module.sx.js'

export default function TeamManagementInfoCard({
  draft,
  clubName,
  isDirty,
  canSave,
  onDraft,
  onConfirm,
  onReset,
  pending,
}) {
  return (
    <Sheet variant="soft" sx={sx.card}>
      <Box sx={sx.firstRow}>
        <Box sx={{ pt: 3 }}>
          <TeamActiveSelector
            value={draft?.active}
            onChange={(v) => onDraft({ ...draft, active: v })}
          />
        </Box>

        <Box sx={{ pt: 3 }}>
          <TeamProjectSelector
            value={draft?.project}
            onChange={(v) => onDraft({ ...draft, project: v })}
          />
        </Box>

        <Box sx={sx.yearWrap}>
          <YearPicker
            label="שנתון"
            size="sm"
            value={draft?.teamYear}
            onChange={(v) => onDraft({ ...draft, teamYear: v })}
            range={{ past: 20, future: 0 }}
          />
        </Box>
      </Box>

      <Box sx={sx.secondRow}>
        <Box sx={{ minWidth: 0 }}>
          <TeamNameField
            value={draft?.teamName || ''}
            size="sm"
            onChange={(v) => onDraft({ ...draft, teamName: v })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <ClubNameField
            value={clubName}
            onChange={() => {}}
            readOnly
            required
            disabled={false}
            helperText=""
          />
        </Box>
      </Box>

      <Box sx={sx.thirdRow}>
        <Box sx={{ minWidth: 0 }}>
          <TeamIfaLinkField
            value={draft?.ifaLink || ''}
            size="sm"
            onChange={(v) => onDraft({ ...draft, ifaLink: v })}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 1.25 }}>
        <Typography level="body-sm" sx={{ fontWeight: 700 }}>
          המצב בליגה
        </Typography>
      </Divider>

      <Box sx={sx.fourthRow}>
        <Box sx={{ minWidth: 0 }}>
          <TeamLeagueNameField
            value={draft?.league || ''}
            size="sm"
            onChange={(v) => onDraft({ ...draft, league: v })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <TeamLeagueLevelField
            value={draft?.leagueLevel || ''}
            size="sm"
            onChange={(v) => onDraft({ ...draft, leagueLevel: v })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <TeamLeaguePosField
            value={draft?.leaguePosition || ''}
            size="sm"
            onChange={(v) => onDraft({ ...draft, leaguePosition: v })}
          />
        </Box>
      </Box>

      <Box sx={sx.fifthRow}>
        <Box sx={{ minWidth: 0 }}>
          <TeamLeaguePointsField
            value={draft?.points || ''}
            size="sm"
            onChange={(v) => onDraft({ ...draft, points: v })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <GoalsForField
            value={draft?.leagueGoalsFor ?? ''}
            size="sm"
            onChange={(v) => onDraft({ ...draft, leagueGoalsFor: v })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <GoalsAgainstField
            value={draft?.leagueGoalsAgainst ?? ''}
            size="sm"
            onChange={(v) => onDraft({ ...draft, leagueGoalsAgainst: v })}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
