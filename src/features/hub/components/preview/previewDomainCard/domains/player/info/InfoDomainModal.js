import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Avatar, Box, Button, Divider, Typography } from '@mui/joy'

import {
  MonthYearPicker,
  DateInputField,
  PlayerFirstNameField,
  PlayerLastNameField,
  PlayerShortNameField,
  PhoneField,
  PlayerActiveSelector,
  PlayerKeyPlayerSelector,
  ProjectStatusSelectField,
} from '../../../../../../../../ui/fields'

import { useUpdateAction } from '../../../../../../../../ui/domains/entityActions/updateAction.js'
import { sx } from './InfoDomainModal.sx.js'

const isPlaceholderPhone = (v) => {
  const s = String(v || '').trim()
  if (!s) return true
  return s === '000-000000' || s === '0000000000' || s === '000000000'
}

const lastValue = (arr) => {
  if (!Array.isArray(arr) || !arr.length) return null
  const v = arr[arr.length - 1]
  if (v === 0) return 0
  return v || null
}

const toStr = (v) => (v == null ? '' : String(v))
const buildPlayerName = (p) => {
  const full = `${toStr(p?.playerFirstName).trim()} ${toStr(p?.playerLastName).trim()}`.trim()
  return full || toStr(p?.playerShortName).trim() || 'שחקן'
}

const pickPatch = (next, initial) => {
  const patch = {}
  for (const k of Object.keys(next)) {
    if (next[k] !== initial[k]) patch[k] = next[k]
  }
  return patch
}

export default function InfoDomainModal({ entity, onClose }) {
  const player = entity || {}

  const initial = useMemo(() => {
    return {
      playerFirstName: toStr(player.playerFirstName),
      playerLastName: toStr(player.playerLastName),
      playerShortName: toStr(player.playerShortName),
      birth: toStr(player.birth),
      birthDay: toStr(player.birthDay),
      phone: toStr(player.phone),
      active: !!player.active,
      isKey: !!player.isKey,
      projectStatus: player.projectStatus ?? null,
      heightLast: lastValue(player.height),
      weightLast: lastValue(player.weight),
      bodyFatLast: lastValue(player.bodyFat),
    }
  }, [player])

  const [form, setForm] = useState(initial)
  useEffect(() => setForm(initial), [initial])

  const entityName = useMemo(() => buildPlayerName(player), [player])

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: 'players',
    snackEntityType: 'player',
    id: player?.id,
    entityName,
    requireAnyUpdated: true,
    createIfMissing: false,
  })

  const dirty = useMemo(() => {
    const next = { ...form }
    const init = { ...initial }
    delete next.heightLast
    delete next.weightLast
    delete next.bodyFatLast
    delete init.heightLast
    delete init.weightLast
    delete init.bodyFatLast
    return Object.keys(pickPatch(next, init)).length > 0
  }, [form, initial])

  const phoneOk = !isPlaceholderPhone(form.phone)

  const onReset = useCallback(() => setForm(initial), [initial])

  const onCloseAndReset = useCallback(() => {
    onReset()
    onClose()
  }, [onClose, onReset])

  const onSave = useCallback(async () => {
    if (!dirty || pending) return

    const next = {
      playerFirstName: String(form.playerFirstName || '').trim() || null,
      playerLastName: String(form.playerLastName || '').trim() || null,
      playerShortName: String(form.playerShortName || '').trim() || null,
      birth: String(form.birth || '').trim() || null,
      birthDay: String(form.birthDay || '').trim() || null,
      phone: String(form.phone || '').trim() || null,
      active: !!form.active,
      isKey: !!form.isKey,
      projectStatus: form.projectStatus ?? null,
    }

    const initComparable = {
      playerFirstName: initial.playerFirstName || null,
      playerLastName: initial.playerLastName || null,
      playerShortName: initial.playerShortName || null,
      birth: initial.birth || null,
      birthDay: initial.birthDay || null,
      phone: initial.phone || null,
      active: !!initial.active,
      isKey: !!initial.isKey,
      projectStatus: initial.projectStatus ?? null,
    }

    const patch = pickPatch(next, initComparable)
    if (Object.keys(patch).length === 0) return

    await runUpdate(patch, { section: 'infoDomain' })
    onClose()
  }, [dirty, pending, form, initial, runUpdate, onClose])

  return (
    <Box sx={sx.root}>
      {/* בלוק 1: שמות */}
      <Typography level="title-sm" sx={sx.sectionTitle(0.75)}>
        פרטים בסיסיים
      </Typography>

      <Box sx={sx.namesGrid}>
        <PlayerFirstNameField
          value={form.playerFirstName}
          onChange={(v) => setForm((p) => ({ ...p, playerFirstName: v }))}
          disabled={pending}
        />
        <PlayerLastNameField
          value={form.playerLastName}
          onChange={(v) => setForm((p) => ({ ...p, playerLastName: v }))}
          disabled={pending}
        />
        <PlayerShortNameField
          value={form.playerShortName}
          onChange={(v) => setForm((p) => ({ ...p, playerShortName: v }))}
          disabled={pending}
        />
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* בלוק 2: פרטי קשר וגיל */}
      <Typography level="title-sm" sx={sx.sectionTitle(0.5)}>
        פרטי קשר וגיל
      </Typography>

      <Box sx={sx.contactGrid}>
        <MonthYearPicker
          value={form.birth}
          onChange={(v) => setForm((p) => ({ ...p, birth: v }))}
          disabled={pending}
          size="sm"
        />
        <DateInputField
          value={form.birthDay}
          onChange={(v) => setForm((p) => ({ ...p, birthDay: v }))}
          disabled={pending}
          size="sm"
        />
        <PhoneField
          value={form.phone}
          onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
          disabled={pending}
          size="sm"
          color={phoneOk ? undefined : 'warning'}
        />
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Typography level="title-sm" sx={sx.sectionTitle(0.5)}>
        סטטוסים
      </Typography>

      <Box sx={sx.statusGrid}>
        <PlayerActiveSelector
          value={!!form.active}
          onChange={(v) => setForm((p) => ({ ...p, active: !!v }))}
          size="sm"
          disabled={pending}
        />
        <PlayerKeyPlayerSelector
          value={!!form.isKey}
          onChange={(v) => setForm((p) => ({ ...p, isKey: !!v }))}
          size="sm"
          disabled={pending}
        />
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Box>
        <ProjectStatusSelectField
          value={form.projectStatus}
          onChange={(v) => setForm((p) => ({ ...p, projectStatus: v }))}
          size="sm"
          disabled={pending}
        />
      </Box>

      {/* פעולות: שמור (ימין) → איפוס → סגירה(כולל איפוס) */}
      <Box sx={sx.actions}>
        <Button
          variant="solid"
          disabled={!dirty || pending}
          loading={pending}
          loadingPosition="center"
          onClick={onSave}
        >
          שמור
        </Button>

        <Button variant="soft" color="neutral" onClick={onReset} disabled={!dirty || pending}>
          איפוס
        </Button>

        <Button variant="outlined" onClick={onCloseAndReset} disabled={pending}>
          סגור
        </Button>
      </Box>
    </Box>
  )
}
