// ui/forms/players/PlayerQuickEditFields.js

import React, { useCallback } from 'react'
import { Box } from '@mui/joy'

import { playerQuickEditLayout } from './quickEdit.layout.js'

import PlayerBirthFields from './edit/PlayerBirthFields.js'
import PlayerIdentityFields from './edit/PlayerIdentityFields.js'
import PlayerStatusFields from './edit/PlayerStatusFields.js'

export default function PlayerQuickEditFields({
  draft,
  setDraft,
  disabled = false,
  mode = 'desktop',
}) {
  const layout = playerQuickEditLayout[mode] || playerQuickEditLayout.desktop

  const handleField = useCallback((key, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [setDraft])

  return (
    <Box sx={layout.root}>
      <PlayerStatusFields
        draft={draft}
        onField={handleField}
        disabled={disabled}
        statusLayout={layout.statusRow}
        planLayout={layout.planRow}
      />

      <PlayerIdentityFields
        draft={draft}
        onField={handleField}
        disabled={disabled}
        layout={layout.sourceRow}
      />

      <PlayerBirthFields
        draft={draft}
        onField={handleField}
        disabled={disabled}
        layout={layout.birthRow}
      />
    </Box>
  )
}
