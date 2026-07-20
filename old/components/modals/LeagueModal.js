// src/features/playersDatabase/components/modals/LeagueModal.js

import React, { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { useAuth } from '../../../../app/AuthProvider.js'
import { PLAYERS_DATABASE_AGE_GROUPS_CATALOG } from '../../catalog/ageGroups.catalog.js'
import { ensureLeagueFromPlan } from '../../services/pdbLeague.firestore.js'
import {
  EMPTY_LEAGUE_FORM,
  buildLeagueDocument,
  createLeagueId,
  deriveLeagueMeta,
  validateLeagueForm,
} from './leagueModalUtils.js'
import { leagueModalSx as sx } from './sx/leagueModal.sx.js'

const createInitialForm = () => ({
  ...EMPTY_LEAGUE_FORM,
})

export default function LeagueModal({ open, onClose, onSaved }) {
  const { user } = useAuth()

  const [form, setForm] = useState(createInitialForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const meta = useMemo(
    () => deriveLeagueMeta(form),
    [form]
  )

  const leagueId = useMemo(
    () => createLeagueId(form),
    [form]
  )

  const canSave = useMemo(
    () => validateLeagueForm(form) && !saving,
    [form, saving]
  )

  const update = (field, value) => {
    setForm(current => ({
      ...current,
      [field]: value,
    }))

    setSaveError('')
  }

  const reset = () => {
    setForm(createInitialForm())
    setSaveError('')
  }

  const close = () => {
    if (saving) return

    reset()
    onClose?.()
  }

  const save = async () => {
    if (!canSave) return

    setSaving(true)
    setSaveError('')

    try {
      const league = buildLeagueDocument(
        form,
        user?.uid || ''
      )

      await ensureLeagueFromPlan(league)
      await onSaved?.(league)

      reset()
      onClose?.()
    } catch (err) {
      setSaveError(
        err?.message || 'שמירת ליגה נכשלה'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={close}>
      <ModalDialog sx={sx.dialog}>
        <ModalClose disabled={saving} />

        <Typography level="title-lg" sx={sx.title}>
          יצירת ליגה
        </Typography>

        <Typography level="body-sm" sx={sx.meta}>
          הרמה מחושבת אוטומטית לפי שם הליגה:
          על, לאומית, ארצית או מחוזית.
        </Typography>

        <Box sx={sx.grid}>
          <Box>
            <Typography sx={sx.fieldLabel}>
              שם ליגה
            </Typography>

            <Input
              size="sm"
              value={form.leagueName}
              disabled={saving}
              onChange={event =>
                update('leagueName', event.target.value)
              }
              sx={sx.fieldControl}
            />
          </Box>

          <Box>
            <Typography sx={sx.fieldLabel}>
              עונה
            </Typography>

            <Input
              size="sm"
              value={form.seasonId}
              disabled={saving}
              placeholder="2025-2026"
              onChange={event =>
                update('seasonId', event.target.value)
              }
              sx={sx.fieldControl}
            />
          </Box>

          <Box>
            <Typography sx={sx.fieldLabel}>
              קבוצת גיל
            </Typography>

            <Select
              size="sm"
              value={form.ageGroupId}
              disabled={saving}
              onChange={(_, value) => {
                if (value) {
                  update('ageGroupId', value)
                }
              }}
              sx={sx.fieldControl}
            >
              {PLAYERS_DATABASE_AGE_GROUPS_CATALOG.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Box>

          <Box>
            <Typography sx={sx.fieldLabel}>
              שנתון
            </Typography>

            <Input
              type="number"
              size="sm"
              value={form.birthYear}
              disabled={saving}
              slotProps={{
                input: {
                  min: 1990,
                  max: 2100,
                  step: 1,
                },
              }}
              onChange={event =>
                update('birthYear', event.target.value)
              }
              sx={sx.fieldControl}
            />
          </Box>

          <Box>
            <Typography sx={sx.fieldLabel}>
              אזור / מחוז
            </Typography>

            <Input
              size="sm"
              value={form.region}
              disabled={saving}
              onChange={event =>
                update('region', event.target.value)
              }
              sx={sx.fieldControl}
            />
          </Box>

          <Box sx={sx.clubsField}>
            <Typography sx={sx.fieldLabel}>
              כמות מועדונים
            </Typography>

            <Input
              type="number"
              size="sm"
              value={form.clubsCount}
              disabled={saving}
              slotProps={{
                input: {
                  min: 1,
                  step: 1,
                },
              }}
              onChange={event =>
                update('clubsCount', event.target.value)
              }
              sx={sx.fieldControl}
            />
          </Box>

          <Box sx={sx.derived}>
            <Typography level="body-sm">
              רמה מחושבת: {meta.level || 'לא זוהתה'}
              {' | '}
              מזהה ליגה: {leagueId || 'ייווצר לאחר הזנת שם'}
            </Typography>
          </Box>
        </Box>

        {saveError && (
          <Typography sx={sx.error}>
            {saveError}
          </Typography>
        )}

        <Box sx={sx.actions}>
          <Button
            size="sm"
            color="primary"
            disabled={!canSave}
            loading={saving}
            onClick={save}
          >
            שמור ליגה
          </Button>

          <Button
            size="sm"
            variant="plain"
            color="neutral"
            disabled={saving}
            onClick={close}
          >
            סגור
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  )
}
