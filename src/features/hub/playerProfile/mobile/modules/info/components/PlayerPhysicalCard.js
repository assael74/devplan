// playerProfile/mobile/modules/info/components/PlayerPhysicalCard.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, Input, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { infoModuleSx as sx } from '../info.module.sx.js'
import {
  buildPlayerPhysicalInitial,
  isPlayerPhysicalDirty,
  buildPlayerPhysicalPatch,
} from '../../../../sharedLogic/info/info.logic.js'

export default function PlayerPhysicalCard({ player, onUpdate }) {
  const initial = useMemo(() => buildPlayerPhysicalInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(initial)
  }, [initial])

  const dirty = isPlayerPhysicalDirty(draft, initial)

  const setField = (key) => (event) => {
    const value = event?.target?.value ?? ''
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const onReset = () => setDraft(initial)

  const onSave = async () => {
    if (!dirty || saving) return
    setSaving(true)
    try {
      await onUpdate(buildPlayerPhysicalPatch(draft), { section: 'physical' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography level="title-md" noWrap startDecorator={iconUi({ id: 'performance' })}>
          מדדים פיזיים
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
          <Box sx={{ display: 'grid', gap: 0.375, minWidth: 0 }}>
            <Typography level="body-xs" sx={{ opacity: 0.7 }}>
              גובה (ס״מ)
            </Typography>
            <Input
              value={draft.heightCm}
              onChange={setField('heightCm')}
              placeholder="לדוגמה: 145"
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>

          <Box sx={{ display: 'grid', gap: 0.375, minWidth: 0 }}>
            <Typography level="body-xs" sx={{ opacity: 0.7 }}>
              משקל (ק״ג)
            </Typography>
            <Input
              value={draft.weightKg}
              onChange={setField('weightKg')}
              placeholder="לדוגמה: 38"
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
