// src/features/players/modules/info/components/PlayerStatusCard.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, Button, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerInfoModuleSx as sx } from '../playerInfo.module.sx.js'
import {
  buildPlayerStatusInitial,
  isPlayerStatusDirty,
  buildPlayerStatusPatch,
  getPlayerActiveChipMeta,
} from './logic/info.logic.js'

import {
  PhoneField,
  PlayerIfaLinkField,
  PlayerActiveSelector,
  SquadRoleSelectField,
} from '../../../../../../ui/fields'

export default function PlayerStatusCard({ player, onUpdate }) {
  const initial = useMemo(() => buildPlayerStatusInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(initial)
  }, [initial])

  const dirty = isPlayerStatusDirty(draft, initial)

  const activeMeta = getPlayerActiveChipMeta(draft?.active)

  const onReset = () => setDraft(initial)

  const onSave = async () => {
    if (!dirty || saving) return

    setSaving(true)
    try {
      const patch = buildPlayerStatusPatch(draft)

      await onUpdate(patch, { section: 'status' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          {iconUi?.({ id: 'info', size: 'sm' }) || null}
          <Typography level="title-md" noWrap>
            סטטוס וטלפון
          </Typography>
        </Box>

        <Chip
          size="sm"
          variant="soft"
          color={draft?.active ? 'success' : 'dnager'}
          startDecorator={iconUi({ id: activeMeta.iconId })}
        >
          {activeMeta.label}
        </Chip>
      </Box>

      <Box sx={sx.statusCardBody}>
        <Box sx={sx.statusTopRow}>
          <Box sx={{ minWidth: 0, width: '100%', pt: 2 }}>
            <PlayerActiveSelector
              value={draft.active}
              onChange={(v) => setDraft((p) => ({ ...p, active: v }))}
            />
          </Box>

          <Box sx={{ minWidth: 0, width: '100%' }}>
            <PlayerIfaLinkField
              value={draft.ifaLink}
              onChange={(v) => setDraft((p) => ({ ...p, ifaLink: v }))}
              size="sm"
              disabled={!dirty || saving}
            />
          </Box>
        </Box>

        <Box sx={sx.statusBottomRow}>
          <Box sx={{ minWidth: 0, width: '100%' }}>
            <PhoneField
              size="sm"
              value={draft.phone}
              onChange={(v) => setDraft((p) => ({ ...p, phone: v }))}
            />
          </Box>

          <Box sx={{ minWidth: 0, width: '100%' }}>
            <SquadRoleSelectField
              size="sm"
              value={draft.squadRole}
              onChange={(next) => setDraft((p) => ({ ...p, squadRole: next || '' }))}
            />
          </Box>
        </Box>
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
