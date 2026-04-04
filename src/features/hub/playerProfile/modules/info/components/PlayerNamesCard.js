// src/features/players/modules/info/components/PlayerNamesCard.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, Button, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerInfoModuleSx as sx } from '../playerInfo.module.sx.js'
import {
  buildPlayerNamesInitial,
  isPlayerNamesDirty,
  getPlayerNamesChipText,
} from './logic/info.logic.js'

import { PlayerFirstNameField, PlayerLastNameField, PlayerShortNameField } from '../../../../../../ui/fields'

export default function PlayerNamesCard({ player, onUpdate }) {
  const initial = useMemo(() => buildPlayerNamesInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  const dirty = isPlayerNamesDirty(draft, initial)

  const chipText = getPlayerNamesChipText(draft)

  useEffect(() => setDraft(initial), [initial.playerFirstName, initial.playerLastName, initial.playerShortName])

  const fullName = [draft.playerFirstName, draft.playerLastName].filter(Boolean).join(' ').trim()

  const onReset = () => setDraft(initial)

  const onSave = async () => {
    if (!dirty || saving) return
    setSaving(true)
    try {
      const patch = {
        playerFirstName: draft.playerFirstName || null,
        playerLastName: draft.playerLastName || null,
        playerShortName: draft.playerShortName || null,
      }
      await onUpdate(patch, { section: 'names' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          {iconUi({ id: 'name', size: 'sm' }) || null}
          <Typography level="title-md" noWrap>
            שמות
          </Typography>
        </Box>

        <Chip size="sm" variant="soft" color={chipText === 'ללא שם' ? 'neutral' : 'primary'}>
          {chipText}
        </Chip>
      </Box>

      <Box sx={sx.formGrid2}>
        <PlayerFirstNameField value={draft.playerFirstName} onChange={(v) => setDraft((p) => ({ ...p, playerFirstName: v }))} />
        <PlayerLastNameField value={draft.playerLastName} onChange={(v) => setDraft((p) => ({ ...p, playerLastName: v }))} />
        <PlayerShortNameField value={draft.playerShortName} onChange={(v) => setDraft((p) => ({ ...p, playerShortName: v }))} />
      </Box>

      <Box sx={sx.actions}>
        <Button
          size="sm"
          variant="soft"
          color="neutral"
          onClick={onReset}
          disabled={!dirty || saving}
          startDecorator={iconUi({ id: 'reset' })}
        >
          איפוס
        </Button>

        <Button
          size="sm"
          variant="solid"
          onClick={onSave}
          disabled={!dirty || saving}
          loading={saving}
          loadingPosition="center"
          sx={sx.confBtn}
          startDecorator={iconUi({ id: 'save' })}
        >
          שמירה
        </Button>
      </Box>
    </Sheet>
  )
}
