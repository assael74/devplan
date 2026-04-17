// playerProfile/mobile/modules/info/components/PlayerBirthCard.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { infoModuleSx as sx } from '../info.module.sx.js'
import {
  buildPlayerBirthInitial,
  isPlayerBirthDirty,
  buildPlayerBirthPatch,
} from '../../../../sharedLogic/info/info.logic.js'
import {
  YearPicker,
  DateInputField,
  MonthNumberPicker,
} from '../../../../../../../ui/fields'

export default function PlayerBirthCard({ player, onUpdate }) {
  const initial = useMemo(() => buildPlayerBirthInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)
  console.log(draft)
  const dirty = isPlayerBirthDirty(draft, initial)

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
      await onUpdate(buildPlayerBirthPatch(draft), { section: 'birth' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography level="title-md" noWrap startDecorator={iconUi({ id: 'birth' })}>
          תאריך לידה ושנתון
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
        <Box sx={sx.formGrid3}>
          <Box sx={{ minWidth: 0 }}>
            <DateInputField
              label="תאריך לידה"
              value={draft.birthDay}
              onChange={setField('birthDay')}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <MonthNumberPicker
              label="חודש"
              icon={false}
              value={draft.month}
              onChange={setField('month')}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <YearPicker
              label="שנתון"
              icon={false}
              value={draft.year}
              onChange={setField('year')}
            />
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
