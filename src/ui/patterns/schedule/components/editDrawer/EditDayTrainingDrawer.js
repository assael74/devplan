// ui/patterns/schedule/components/editDrawer/EditDayTrainingDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Drawer,
  Typography,
  Sheet,
  DialogContent,
  DialogTitle,
  ModalClose,
  Tooltip,
  IconButton,
} from '@mui/joy'

import HourInputField from '../../../../fields/dateUi/HourInputField.js'
import DurationField from '../../../../fields/inputUi/trainings/DurationField.js'
import TrainingsTypeSelectField from '../../../../fields/selectUi/trainings/TrainingsTypeSelectField.js'
import TrainingsStatusSelectField from '../../../../fields/selectUi/trainings/TrainingsSatusSelectField.js'
import TrainingLocationField from '../../../../fields/inputUi/trainings/TrainingLocationField.js'

import { useTeamHubUpdate } from '../../../../../features/hub/hooks/teams/useTeamHubUpdate.js'
import { iconUi } from '../../../../core/icons/iconUi.js'
import { getEntityColors } from '../../../../core/theme/Colors.js'
import { trainingWeekDrawerSx as sx } from '../../sx/trainingWeekDrawer.sx.js'

import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
  getIsValid,
} from './logic/editDayTrainingDrawer.logic.js'

const c = getEntityColors('training')

export default function EditDayTrainingDrawer({
  open,
  team = null,
  week = null,
  onClose,
  onSaved,
  title = 'עריכת יום אימון',
  subtitle = 'עדכון שעה, משך, סוג ומיקום ליום שנבחר',
}) {
  const initial = useMemo(() => buildInitialDraft(team, week), [team, week])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const isValid = useMemo(() => getIsValid(draft), [draft])
  const patch = useMemo(() => buildPatch(draft, initial, team), [draft, initial, team])

  const { run, pending } = useTeamHubUpdate(team)
  const canSave = Boolean(initial?.teamId && initial?.weekId && initial?.dayKey && isValid && isDirty && !pending)

  const handleChange = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleReset = () => {
    setDraft(initial)
  }

  const handleSave = async () => {
    if (!canSave) return

    await run('training', patch, {
      section: 'training',
      teamId: initial.teamId,
      createIfMissing: true,
    })

    if (onSaved) onSaved(patch, draft)
    if (onClose) onClose()
  }

  return (
    <Drawer
      size="md"
      variant="plain"
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ content: { sx: sx.drawerSx } }}
    >
      <Sheet sx={sx.drawerSheet}>
        <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1, boxShadow: 'sm' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={sx.headerIcon}>{iconUi({ id: 'training' })}</Box>

            <Box sx={sx.titleWrap}>
              <Typography level="title-md" sx={sx.title}>
                {title}
              </Typography>

              <Typography level="body-xs" sx={sx.subtitle}>
                {subtitle}
              </Typography>

              <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
                {draft?.dayLabel || ''} {draft?.dateLabel ? `· ${draft.dateLabel}` : ''}
              </Typography>
            </Box>
          </Box>

          <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
        </DialogTitle>

        <DialogContent sx={{ gap: 2 }}>
          <Box sx={{ display: 'grid', gap: 1.5, py: 0.5, px: 1 }}>

          <Box
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: {
                xs: '1fr',
                md: '1fr 1fr',
              },
              my: 1
            }}
          >
            <HourInputField
              value={draft?.hour || ''}
              onChange={(value) => handleChange('hour', value || '')}
            />

            <DurationField
              value={draft?.duration ?? 0}
              onChange={(value) => handleChange('duration', value ?? 0)}
            />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 1,
                my: 1,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '1fr 1fr',
                },
              }}
            >
              <TrainingsTypeSelectField
                value={draft?.type || ''}
                onChange={(value) => handleChange('type', value || '')}
              />

              <TrainingsStatusSelectField
                value={draft?.status || ''}
                onChange={(value) => handleChange('status', value || '')}
              />
            </Box>

            <TrainingLocationField
              value={draft?.location || ''}
              placeholder="לדוגמה: מגרש סינטטי"
              onChange={(v) => setDraft({ ...draft, location: v })}
            />
          </Box>
        </DialogContent>

        <Box sx={sx.footerSx}>
          <Box sx={sx.footerActionsSx}>
            <Button
              loading={pending}
              disabled={!canSave}
              startDecorator={iconUi({ id: 'save' })}
              onClick={handleSave}
              sx={sx.conBut}
            >
              שמירה
            </Button>

            <Button
              color="neutral"
              variant="outlined"
              onClick={onClose}
              disabled={pending}
            >
              ביטול
            </Button>

            <Tooltip title="איפוס השינויים">
              <span>
                <IconButton
                  disabled={!isDirty || pending}
                  size="sm"
                  variant="soft"
                  sx={sx.icoRes}
                  onClick={handleReset}
                >
                  {iconUi({ id: 'reset' })}
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Typography
            level="body-xs"
            color={!isValid ? 'warning' : isDirty ? 'danger' : 'neutral'}
          >
            {!isValid ? 'יש שדות חובה חסרים' : isDirty ? 'יש שינויים שלא נשמרו' : 'אין שינויים'}
          </Typography>
        </Box>
      </Sheet>
    </Drawer>
  )
}
