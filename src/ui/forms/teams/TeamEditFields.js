// ui/forms/teams/TeamEditFields.js

import React from 'react'
import { Box, Divider, Typography } from '@mui/joy'

import { teamEditLayout } from './edit.layout.js'
import TeamIdentityFields from './edit/TeamIdentityFields.js'
import TeamLeagueFields from './edit/TeamLeagueFields.js'
import TeamSourceFields from './edit/TeamSourceFields.js'
import TeamTargetsFields from './edit/TeamTargetsFields.js'
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
  const onField = (key, value) => {
    setField(setDraft, key, value)
  }

  return (
    <Box sx={sx.root}>
      <TeamIdentityFields
        draft={draft}
        onField={onField}
        layout={teamEditLayout.full.identity}
        statusLayout={teamEditLayout.full.status}
        fieldDisabled={fieldDisabled}
      />

      <Divider sx={{ mt: 3 }}>
        <Typography level='body-sm' sx={{ fontWeight: 700 }}>
          המצב בליגה
        </Typography>
      </Divider>

      <TeamLeagueFields
        draft={draft}
        onField={onField}
        mainLayout={teamEditLayout.full.leagueMain}
        statsLayout={teamEditLayout.full.leagueStats}
        fieldDisabled={fieldDisabled}
      />

      <Divider sx={{ my: 2 }}>
        <Typography level='body-sm' sx={{ fontWeight: 700 }}>
          יעדים
        </Typography>
      </Divider>

      <TeamTargetsFields
        draft={draft}
        onField={onField}
        mainLayout={teamEditLayout.full.targetsMain}
        goalsLayout={teamEditLayout.full.targetsGoals}
        fieldDisabled={fieldDisabled}
      />

      <Divider sx={{ my: 2 }}>
        <Typography level='body-sm' sx={{ fontWeight: 700 }}>
          כללי
        </Typography>
      </Divider>

      <TeamSourceFields
        draft={draft}
        onField={onField}
        layout={teamEditLayout.full.source}
        fieldDisabled={fieldDisabled}
      />
    </Box>
  )
}
