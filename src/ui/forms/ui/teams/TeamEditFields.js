// ui/forms/ui/teams/TeamEditFields.js

import React from 'react'
import {
  Box,
  Typography,
  Divider,
  FormControl,
  FormLabel,
  Input,
} from '@mui/joy'

import TeamNameField from '../../../fields/inputUi/teams/TeamNameField.js'
import TeamLeagueNameField from '../../../fields/inputUi/teams/TeamLeagueNameField.js'
import TeamLeaguePosField from '../../../fields/inputUi/teams/TeamLeaguePosField.js'
import TeamLeaguePointsField from '../../../fields/inputUi/teams/TeamLeaguePointsField.js'
import TeamLeagueLevelField from '../../../fields/inputUi/teams/TeamLeagueLevelField.js'

import GoalsAgainstField from '../../../fields/inputUi/games/GoalsAgainstField.js'
import GoalsForField from '../../../fields/inputUi/games/GoalsForField.js'
import TeamIfaLinkField from '../../../fields/inputUi/teams/TeamIfaLinkField.js'
import YearPicker from '../../../fields/dateUi/YearPicker.js'
import TeamProjectSelector from '../../../fields/checkUi/teams/TeamProjectSelector.js'
import TeamActiveSelector from '../../../fields/checkUi/teams/TeamActiveSelector.js'

import { editSx as sx } from './sx/edit.sx.js'

function setField(setDraft, key, value) {
  setDraft((prev) => ({
    ...prev,
    [key]: value,
  }))
}

export default function TeamEditFields({
  draft,
  setDraft,
  fieldDisabled = {},
}) {
  return (
    <Box sx={sx.root}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <TeamNameField
            required
            value={draft?.teamName || ''}
            onChange={(value) => setField(setDraft, 'teamName', value)}
            size="sm"
            disabled={fieldDisabled?.teamName}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <YearPicker
            label="שנתון"
            value={draft?.teamYear || ''}
            onChange={(value) => setField(setDraft, 'teamYear', value)}
            required
            clearable={false}
            range={{ past: 20, future: 0 }}
            size="sm"
            disabled={fieldDisabled?.teamYear}
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
            onChange={(value) => setField(setDraft, 'league', value)}
            size="sm"
            disabled={fieldDisabled?.league}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <TeamLeagueLevelField
            value={draft?.leagueLevel ?? ''}
            onChange={(value) => setField(setDraft, 'leagueLevel', value)}
            size="sm"
            disabled={fieldDisabled?.leagueLevel}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <TeamLeaguePosField
            value={draft?.leaguePosition ?? ''}
            onChange={(value) => setField(setDraft, 'leaguePosition', value)}
            size="sm"
            disabled={fieldDisabled?.leaguePosition}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <TeamLeaguePointsField
            value={draft?.points ?? ''}
            onChange={(value) => setField(setDraft, 'points', value)}
            size="sm"
            disabled={fieldDisabled?.points}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <GoalsForField
            label="שערי זכות בליגה"
            value={draft?.leagueGoalsFor ?? ''}
            onChange={(value) => setField(setDraft, 'leagueGoalsFor', value)}
            size="sm"
            disabled={fieldDisabled?.leagueGoalsFor}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <GoalsAgainstField
            label="שערי חובה בליגה"
            value={draft?.leagueGoalsAgainst ?? ''}
            onChange={(value) => setField(setDraft, 'leagueGoalsAgainst', value)}
            size="sm"
            disabled={fieldDisabled?.leagueGoalsAgainst}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }}>
        <Typography level="body-sm" sx={{ fontWeight: 700 }}>
          יעדים
        </Typography>
      </Divider>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <TeamLeaguePosField
            label="יעד מיקום בליגה"
            value={draft?.targetPosition ?? ''}
            onChange={(value) => setField(setDraft, 'targetPosition', value)}
            size="sm"
            variant="soft"
            color="primary"
            disabled={fieldDisabled?.targetPosition}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <TeamLeaguePointsField
            label="יעד נקודות"
            value={draft?.targetPoints ?? ''}
            onChange={(value) => setField(setDraft, 'targetPoints', value)}
            size="sm"
            variant="soft"
            color="primary"
            disabled={fieldDisabled?.targetPoints}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <FormControl size="sm" disabled={fieldDisabled?.targetSuccessRate}>
            <FormLabel>יעד אחוז הצלחה</FormLabel>
            <Input
              size="sm"
              value={draft?.targetSuccessRate ?? ''}
              variant="soft"
              color="primary"
              onChange={(event) => {
                setField(setDraft, 'targetSuccessRate', event.target.value)
              }}
              endDecorator={
                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                  %
                </Typography>
              }
            />
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <GoalsForField
            label="יעד שערי זכות"
            value={draft?.targetGoalsFor ?? ''}
            onChange={(value) => setField(setDraft, 'targetGoalsFor', value)}
            size="sm"
            variant="soft"
            color="primary"
            disabled={fieldDisabled?.targetGoalsFor}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <GoalsAgainstField
            label="יעד שערי חובה"
            value={draft?.targetGoalsAgainst ?? ''}
            onChange={(value) => setField(setDraft, 'targetGoalsAgainst', value)}
            size="sm"
            variant="soft"
            color="primary"
            disabled={fieldDisabled?.targetGoalsAgainst}
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
            onChange={(value) => setField(setDraft, 'ifaLink', value)}
            size="sm"
            disabled={fieldDisabled?.ifaLink}
          />
        </Box>

        <Box sx={sx.status}>
          <TeamProjectSelector
            value={draft?.project === true}
            onChange={(value) => setField(setDraft, 'project', value)}
            size="sm"
            disabled={fieldDisabled?.project}
          />

          <TeamActiveSelector
            value={draft?.active === true}
            onChange={(value) => setField(setDraft, 'active', value)}
            size="sm"
            disabled={fieldDisabled?.active}
          />
        </Box>
      </Box>
    </Box>
  )
}
