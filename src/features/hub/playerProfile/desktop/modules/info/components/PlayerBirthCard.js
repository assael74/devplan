// playerProfile/desktop/modules/info/components/PlayerBirthCard.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, Button, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { playerInfoModuleSx as sx } from '../playerInfo.module.sx.js'
import { MonthYearPicker, DateInputField } from '../../../../../../../ui/fields'

const toStr = (v) => (v == null ? '' : String(v))

function buildInitial(player) {
  return {
    birth: toStr(player?.birth),
    birthDay: toStr(player?.birthDay),
  }
}

function isDirty(draft, initial) {
  return (
    toStr(draft?.birth) !== toStr(initial?.birth) ||
    toStr(draft?.birthDay) !== toStr(initial?.birthDay)
  )
}

export default function PlayerBirthCard({ player, onUpdate }) {
  const initial = useMemo(() => buildInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  const dirty = isDirty(draft, initial)

  useEffect(() => {
    setDraft(initial)
  }, [initial.birth, initial.birthDay])

  const hasBirth = Boolean(draft.birth)
  const hasBirthDay = Boolean(draft.birthDay)

  const onReset = () => setDraft(initial)

  const onSave = async () => {
    if (!dirty || saving) return

    setSaving(true)
    try {
      const patch = {
        birth: draft.birth || null,
        birthDay: draft.birthDay || null,
      }

      await onUpdate?.(patch, { section: 'birth' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          {iconUi({ id: 'birth', size: 'sm' }) || null}
          <Typography level="title-md" noWrap>
            תאריך לידה ושנתון
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Chip size="sm" variant="soft" color={hasBirth ? 'primary' : 'neutral'}>
            {hasBirth ? `שנתון ${draft.birth}` : 'ללא שנתון'}
          </Chip>

          <Chip size="sm" variant="soft" color={hasBirthDay ? 'primary' : 'neutral'}>
            {hasBirthDay ? 'תאריך מלא' : 'ללא תאריך מלא'}
          </Chip>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 1 }}>
        <MonthYearPicker
          value={draft.birth}
          onChange={(v) => setDraft((prev) => ({ ...prev, birth: v }))}
        />

        <DateInputField
          value={draft.birthDay}
          onChange={(v) => setDraft((prev) => ({ ...prev, birthDay: v }))}
        />
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
