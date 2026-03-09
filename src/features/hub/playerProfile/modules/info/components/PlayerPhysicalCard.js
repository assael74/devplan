// src/features/players/modules/info/components/PlayerPhysicalCard.js
import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, Input, Button, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerInfoModuleSx as sx } from '../playerInfo.module.sx.js'

const toNum = (v) => {
  if (v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function computeInitial(player) {
  const heightCm = toNum(player?.heightCm ?? player?.height ?? player?.physical?.heightCm ?? null)
  const weightKg = toNum(player?.weightKg ?? player?.weight ?? player?.physical?.weightKg ?? null)

  return {
    heightCm: heightCm == null ? '' : String(heightCm),
    weightKg: weightKg == null ? '' : String(weightKg),
  }
}

function isDirty(d, i) {
  return d.heightCm !== i.heightCm || d.weightKg !== i.weightKg
}

function calcBmi(heightCm, weightKg) {
  const h = toNum(heightCm)
  const w = toNum(weightKg)
  if (!h || !w) return null
  const hm = h / 100
  if (!hm) return null
  const bmi = w / (hm * hm)
  return Number.isFinite(bmi) ? bmi : null
}

export default function PlayerPhysicalCard({ player, onUpdate }) {
  const initial = useMemo(() => computeInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  useEffect(() => setDraft(initial), [initial.heightCm, initial.weightKg])

  const dirty = isDirty(draft, initial)
  const bmi = calcBmi(draft.heightCm, draft.weightKg)
  const bmiText = bmi == null ? 'BMI —' : `BMI ${bmi.toFixed(1)}`

  const onReset = () => setDraft(initial)

  const onSave = async () => {
    if (!dirty || saving) return
    setSaving(true)
    try {
      const heightCm = toNum(draft.heightCm)
      const weightKg = toNum(draft.weightKg)
      const patch = {}
      patch.heightCm = heightCm
      patch.weightKg = weightKg
      await onUpdate?.(patch, { section: 'physical' })
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
        <Button size="sm" variant="soft" color="neutral" onClick={onReset} disabled={!dirty || saving}>
          איפוס
        </Button>
        <Button size="sm" variant="solid" onClick={onSave} loading={saving} loadingPosition="center" disabled={!dirty || saving}>
          שמירה
        </Button>
      </Box>
    </Sheet>
  )
}
