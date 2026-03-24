// clubProfile/modules/teams/components/drawer/EditContentDrawer.js

import React from 'react'
import { Box, Typography, Divider } from '@mui/joy'

import TeamNameField from '../../../../../../../ui/fields/inputUi/teams/TeamNameField'
import TeamLeagueNameField from '../../../../../../../ui/fields/inputUi/teams/TeamLeagueNameField'
import TeamLeaguePosField from '../../../../../../../ui/fields/inputUi/teams/TeamLeaguePosField'
import TeamLeaguePointsField from '../../../../../../../ui/fields/inputUi/teams/TeamLeaguePointsField'
import TeamLeagueLevelField from '../../../../../../../ui/fields/inputUi/teams/TeamLeagueLevelField'
import GoalsAgainstField from '../../../../../../../ui/fields/inputUi/games/GoalsAgainstField'
import GoalsForField from '../../../../../../../ui/fields/inputUi/games/GoalsForField'
import TeamIfaLinkField from '../../../../../../../ui/fields/inputUi/teams/TeamIfaLinkField'
import YearPicker from '../../../../../../../ui/fields/dateUi/YearPicker'
import TeamProjectSelector from '../../../../../../../ui/fields/checkUi/teams/TeamProjectSelector'
import TeamActiveSelector from '../../../../../../../ui/fields/checkUi/teams/TeamActiveSelector'

function setField(setDraft, key, value) {
  setDraft((prev) => ({ ...prev, [key]: value }))
}

export default function EditContentDrawer({
  draft,
  setDraft,
}) {
  return (
    <Box sx={{ display: 'grid', gap: 1.25, width: '100%', minWidth: 0, maxWidth: '100%', overflow: 'hidden', }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <TeamNameField
            required
            value={draft?.teamName || ''}
            onChange={(v) => setField(setDraft, 'teamName', v)}
            size="sm"
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <YearPicker
            label="שנתון"
            value={draft?.teamYear || ''}
            onChange={(v) => setField(setDraft, 'teamYear', v)}
            required
            clearable={false}
            range={{ past: 20, future: 0 }}
            size="sm"
          />
        </Box>
      </Box>

      <Divider sx={{ mt: 3 }}>
        <Typography level="body-sm" sx={{ fontWeight: 700 }}>
          המצב בליגה
        </Typography>
      </Divider>

      <Box sx={{ display: 'grid', gridTemplateColumns: '.9fr .6fr .6fr', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <TeamLeagueNameField
            value={draft?.league || ''}
            onChange={(v) => setField(setDraft, 'league', v)}
            size="sm"
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <TeamLeagueLevelField
            value={draft?.leagueLevel ?? ''}
            onChange={(v) => setField(setDraft, 'leagueLevel', v)}
            size="sm"
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <TeamLeaguePosField
            value={draft?.leaguePosition ?? ''}
            onChange={(v) => setField(setDraft, 'leaguePosition', v)}
            size="sm"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <TeamLeaguePointsField
            value={draft?.points ?? ''}
            onChange={(v) => setField(setDraft, 'points', v)}
            size="sm"
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <GoalsForField
            label="שערי זכות בליגה"
            value={draft?.leagueGoalsFor ?? ''}
            onChange={(v) => setField(setDraft, 'leagueGoalsFor', v)}
            size="sm"
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <GoalsAgainstField
            label="שערי חובה בליגה"
            value={draft?.leagueGoalsAgainst ?? ''}
            onChange={(v) => setField(setDraft, 'leagueGoalsAgainst', v)}
            size="sm"
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }}>
        <Typography level="body-sm" sx={{ fontWeight: 700 }}>
          כללי
        </Typography>
      </Divider>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <TeamIfaLinkField
            value={draft?.ifaLink || ''}
            onChange={(v) => setField(setDraft, 'ifaLink', v)}
            size="sm"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start', alignItems: 'flex-end', pt: 3 }}>
          <TeamProjectSelector
            value={draft?.project === true}
            onChange={(v) => setField(setDraft, 'project', v)}
            size="sm"
          />

          <TeamActiveSelector
            value={draft?.active === true}
            onChange={(v) => setField(setDraft, 'active', v)}
            size="sm"
          />
        </Box>
      </Box>
    </Box>
  )
}
