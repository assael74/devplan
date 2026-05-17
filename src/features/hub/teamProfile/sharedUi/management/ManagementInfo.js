// teamProfile/sharedUi/management/ManagementInfo.js

import React from 'react'
import { Box, Sheet } from '@mui/joy'

import TeamLeagueNameField from '../../../../../ui/fields/inputUi/teams/TeamLeagueNameField'
import TeamLeagueLevelField from '../../../../../ui/fields/inputUi/teams/TeamLeagueLevelField'
import TeamLeagueRoundField from '../../../../../ui/fields/inputUi/teams/TeamLeagueRoundField'

import TeamNameField from '../../../../../ui/fields/inputUi/teams/TeamNameField.js'
import TeamIfaLinkField from '../../../../../ui/fields/inputUi/teams/TeamIfaLinkField.js'
import TeamActiveSelector from '../../../../../ui/fields/checkUi/teams/TeamActiveSelector.js'
import TeamProjectSelector from '../../../../../ui/fields/checkUi/teams/TeamProjectSelector.js'
import ClubNameField from '../../../../../ui/fields/inputUi/clubs/ClubNameField.js'
import YearPicker from '../../../../../ui/fields/dateUi/YearPicker'

import { infoSx as sx } from './sx/info.sx.js'

export default function ManagementInfo({
  draft,
  clubName,
  onDraft,
  pending,
  isMobile = false,
}) {
  const handleDraft = (field, value) => {
    onDraft({
      ...draft,
      [field]: value,
    })
  }

  return (
    <Sheet variant="soft" sx={sx.card(isMobile)}>
      <Box sx={sx.firstRow}>
        <Box sx={sx.chipsRow(isMobile)}>
          <TeamActiveSelector
            value={draft.active}
            onChange={(value) => handleDraft('active', value)}
          />

          <TeamProjectSelector
            value={draft.project}
            onChange={(value) => handleDraft('project', value)}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <YearPicker
            label="שנתון"
            size="sm"
            value={draft.teamYear}
            onChange={(value) => handleDraft('teamYear', value)}
            range={{
              past: 20,
              future: 0,
            }}
          />
        </Box>
      </Box>

      <Box sx={sx.secondRow}>
        <TeamNameField
          value={draft.teamName}
          size="sm"
          onChange={(value) => handleDraft('teamName', value)}
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
          onChange={(value) => handleDraft('ifaLink', value)}
        />
      </Box>

      <Box sx={sx.forthRow(isMobile)}>
        <Box sx={{ minWidth: 0 }}>
          <TeamLeagueNameField
            value={draft.league || ''}
            size="sm"
            label="ליגה"
            variant="outlined"
            disabled={pending}
            onChange={(value) => handleDraft('league', value)}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <TeamLeagueLevelField
            value={draft.leagueLevel || ''}
            size="sm"
            label="רמת ליגה"
            variant="outlined"
            disabled={pending}
            onChange={(value) => handleDraft('leagueLevel', value)}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <TeamLeagueRoundField
            value={draft.leagueRound || ''}
            size="sm"
            variant="outlined"
            disabled={pending}
            max={40}
            onChange={(value) => handleDraft('leagueRound', value)}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <TeamLeagueRoundField
            value={draft.leagueNumGames || ''}
            size="sm"
            placeholder='סה"כ מחזורים'
            label="מחזורי ליגה"
            variant="outlined"
            disabled={pending}
            max={40}
            onChange={(value) => handleDraft('leagueNumGames', value)}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
