// ui/forms/players/PlayerEditFields.js

import React, { useCallback } from 'react'
import { Box } from '@mui/joy'

import { editSx as sx } from './sx/edit.sx.js'

import PlayerBirthFields from './edit/PlayerBirthFields.js'
import PlayerIdentityFields from './edit/PlayerIdentityFields.js'
import PlayerNamesFields from './edit/PlayerNamesFields.js'
import PlayerStatusFields from './edit/PlayerStatusFields.js'

const namesLayout = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, minmax(0, 1fr))',
  },
  gap: 1,
}

const identityLayout = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, minmax(0, 1fr))',
  },
  gap: 1,
}

const birthLayout = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'minmax(0, 1fr) 110px 110px',
  },
  gap: 1,
  alignItems: 'flex-end',
}

export default function PlayerEditFields({
  draft,
  setDraft,
  fieldDisabled = {},
}) {
  const handleField = useCallback((key, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [setDraft])

  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <Box sx={sx.sectionCard}>
        <PlayerNamesFields
          draft={draft}
          onField={handleField}
          disabled={fieldDisabled.names === true}
          layout={namesLayout}
        />

        <PlayerIdentityFields
          draft={draft}
          onField={handleField}
          disabled={fieldDisabled.identity === true}
          layout={identityLayout}
        />

        <PlayerBirthFields
          draft={draft}
          onField={handleField}
          disabled={fieldDisabled.birth === true}
          layout={birthLayout}
        />
      </Box>

      <Box sx={sx.sectionCard}>
        <PlayerStatusFields
          draft={draft}
          onField={handleField}
          disabled={fieldDisabled.status === true}
          statusLayout={sx.statusTopRow}
          planLayout={sx.roleTypeWrap}
          size="sm"
        />
      </Box>
    </Box>
  )
}
