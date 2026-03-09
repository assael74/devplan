// src/features/players/modules/info/components/PlayerStatusCard.js
import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, Button, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerInfoModuleSx as sx } from '../playerInfo.module.sx.js'

import { PhoneField, PlayerTypeSelector, PlayerActiveSelector } from '../../../../../../ui/fields'

const toStr = (v) => (v == null ? '' : String(v))

function computeInitial(player) {
  return {
    active: Boolean(player?.active),
    phone: toStr(player?.phone),
    type: toStr(player?.type || 'noneType'),
  }
}

function isDirty(draft, initial) {
  return draft.active !== initial.active || draft.phone !== initial.phone || draft.type !== initial.type
}

export default function PlayerStatusCard({ player, onUpdate }) {
  const initial = useMemo(() => computeInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  useEffect(() => setDraft(initial), [initial.active, initial.phone, initial.type])

  const dirty = isDirty(draft, initial)
  const isProject = draft.type === 'project'

  const onReset = () => setDraft(initial)

  const onSave = async () => {
    if (!dirty || saving) return
    setSaving(true)
    try {
      const patch = {
        active: draft.active,
        phone: draft.phone || null,
        type: draft.type || 'noneType',
      }
      if (patch.type !== 'project') patch.projectStatus = null
      await onUpdate?.(patch, { section: 'status' })
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
          color={isProject ? 'success' : 'neutral'}
          startDecorator={isProject ? iconUi?.({ id: 'project', size: 'sm' }) : null}
        >
          {isProject ? 'פרויקט' : 'כללי'}
        </Chip>
      </Box>

      <Box sx={sx.formGrid2}>
        {/* פעיל */}
        <Box
          sx={{
            minWidth: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '& > *': { width: '100%' },
            maxWidth: { md: 80 },
            mt: 2,
          }}
        >
          <PlayerActiveSelector value={draft.active} onChange={(v) => setDraft((p) => ({ ...p, active: v }))} />
        </Box>
        {/* טלפון */}
        <Box sx={{ mt: -1 }}>
          <PhoneField size='sm' value={draft.phone} onChange={(v) => setDraft((p) => ({ ...p, phone: v }))} />
        </Box>
        {/* סוג שחקן */}
        <PlayerTypeSelector
          value={draft.type}
          onChange={(next) => setDraft((p) => ({ ...p, type: next || 'noneType' }))}
        />
      </Box>

      <Box sx={sx.actions}>
        <Button size="sm" variant="soft" color="neutral" onClick={onReset} disabled={!dirty || saving}>
          איפוס
        </Button>
        <Button size="sm" variant="solid" onClick={onSave} disabled={!dirty || saving} loading={saving} loadingPosition="center">
          שמירה
        </Button>
      </Box>
    </Sheet>
  )
}
