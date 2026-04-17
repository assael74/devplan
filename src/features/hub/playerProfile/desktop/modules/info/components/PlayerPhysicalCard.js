// playerProfile/desktop/modules/info/components/PlayerPhysicalCard.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, Input, Button, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { playerInfoModuleSx as sx } from '../playerInfo.module.sx.js'
import {
  buildPlayerPhysicalInitial,
  isPlayerPhysicalDirty,
  calcPlayerBmi,
  getPlayerBmiText,
  buildPlayerPhysicalPatch,
} from '../../../../sharedLogic/info/info.logic.js'

export default function PlayerPhysicalCard({ player, onUpdate }) {
  const initial = useMemo(() => buildPlayerPhysicalInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  useEffect(() => setDraft(initial), [initial.heightCm, initial.weightKg])

  const dirty = isPlayerPhysicalDirty(draft, initial)
  const bmi = calcPlayerBmi(draft.heightCm, draft.weightKg)
  const bmiText = getPlayerBmiText(draft.heightCm, draft.weightKg)

  const onReset = () => setDraft(initial)

  const onSave = async () => {
    if (!dirty || saving) return
    setSaving(true)
    try {
      const patch = buildPlayerPhysicalPatch(draft)
      await onUpdate(patch, { section: 'physical' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          {iconUi?.({ id: 'performance', size: 'sm' }) || null}
          <Typography level="title-md" noWrap>
            מדדים פיזיים
          </Typography>
        </Box>

        <Chip size="sm" variant="soft" color={bmi == null ? 'neutral' : 'primary'}>
          {bmiText}
        </Chip>
      </Box>

      <Box sx={sx.formGrid2}>
        <Box sx={{ display: 'grid', gap: 0.5 }}>
          <Typography level="body-xs" sx={{ opacity: 0.7 }}>
            גובה (ס״מ)
          </Typography>
          <Input
            value={draft.heightCm}
            onChange={(e) => setDraft((p) => ({ ...p, heightCm: e.target.value }))}
            placeholder="לדוגמה: 145"
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 0.5 }}>
          <Typography level="body-xs" sx={{ opacity: 0.7 }}>
            משקל (ק״ג)
          </Typography>
          <Input
            value={draft.weightKg}
            onChange={(e) => setDraft((p) => ({ ...p, weightKg: e.target.value }))}
            placeholder="לדוגמה: 38"
          />
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
