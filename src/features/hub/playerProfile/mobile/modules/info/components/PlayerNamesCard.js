// playerProfile/mobile/modules/info/components/PlayerNamesCard.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { infoModuleSx as sx } from '../info.module.sx.js'
import {
  buildPlayerNamesInitial,
  isPlayerNamesDirty,
  buildPlayerNamesPatch,
} from '../../../../sharedLogic/info/info.logic.js'
import {
  PlayerFirstNameField,
  PlayerLastNameField,
  PlayerShortNameField,
} from '../../../../../../../ui/fields'

export default function PlayerNamesCard({ player, onUpdate }) {
  const initial = useMemo(() => buildPlayerNamesInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  const dirty = isPlayerNamesDirty(draft, initial)

  useEffect(() => {
    setDraft(initial)
  }, [initial])

  const setField = (key) => (value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const onReset = () => setDraft(initial)

  const onSave = async () => {
    if (!dirty || saving) return
    setSaving(true)
    try {
      await onUpdate(buildPlayerNamesPatch(draft), { section: 'names' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography level="title-md" noWrap startDecorator={iconUi({ id: 'info' })}>
          שם השחקן
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="sm"
            variant="soft"
            color="warning"
            onClick={onReset}
            disabled={!dirty || saving}
          >
            {iconUi({ id: 'reset' })}
          </IconButton>

          <IconButton
            size="sm"
            variant="solid"
            onClick={onSave}
            disabled={!dirty || saving}
            loading={saving}
            sx={sx.confBtn}
          >
            {iconUi({ id: 'save' })}
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.875, minWidth: 0 }}>
        <Box sx={sx.formGrid2}>
          <Box sx={{ minWidth: 0 }}>
            <PlayerFirstNameField
              size="sm"
              value={draft.playerFirstName}
              onChange={setField('playerFirstName')}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <PlayerLastNameField
              size="sm"
              value={draft.playerLastName}
              onChange={setField('playerLastName')}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <PlayerShortNameField
              size="sm"
              value={draft.playerShortName}
              onChange={setField('playerShortName')}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
