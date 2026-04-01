// src/features/players/modules/info/components/PlayerStatusCard.js

// src/features/players/modules/info/components/PlayerStatusCard.js
import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, Button, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerInfoModuleSx as sx } from '../playerInfo.module.sx.js'

import {
  PhoneField,
  PlayerTypeSelector,
  PlayerActiveSelector,
  SquadRoleSelectField,
} from '../../../../../../ui/fields'

const toStr = (v) => (v == null ? '' : String(v))

function computeInitial(player) {
  return {
    active: Boolean(player?.active),
    phone: toStr(player?.phone),
    type: toStr(player?.type || 'noneType'),
    squadRole: toStr(player?.squadRole || ''),
  }
}

function isDirty(draft, initial) {
  return (
    draft.active !== initial.active ||
    draft.phone !== initial.phone ||
    draft.type !== initial.type ||
    draft.squadRole !== initial.squadRole
  )
}

export default function PlayerStatusCard({ player, onUpdate }) {
  const initial = useMemo(() => computeInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(initial)
  }, [initial])

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
        squadRole: draft.squadRole || '',
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

      <Box sx={sx.statusCardBody}>
        <Box sx={sx.statusTopRow}>
          <Box sx={sx.activeFieldWrap}>
            <PlayerActiveSelector
              value={draft.active}
              onChange={(v) => setDraft((p) => ({ ...p, active: v }))}
            />
          </Box>

          <Box sx={{ minWidth: 0, width: '100%' }}>
            <PhoneField
              size="sm"
              value={draft.phone}
              onChange={(v) => setDraft((p) => ({ ...p, phone: v }))}
            />
          </Box>
        </Box>

        <Box sx={sx.statusBottomRow}>
          <Box sx={{ minWidth: 0, width: '100%' }}>
            <PlayerTypeSelector
              size="sm"
              value={draft.type}
              onChange={(next) => setDraft((p) => ({ ...p, type: next || 'noneType' }))}
            />
          </Box>

          <Box sx={sx.squadRoleFieldWrap}>
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
