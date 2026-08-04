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

import TrainingDayEditFields from '../../../../forms/trainings/TrainingDayEditFields.js'
import { getTrainingDayEditFormLayout } from '../../../../forms/trainings/dayEdit.layout.js'

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
const layout = getTrainingDayEditFormLayout()

export default function EditDayTrainingDrawer({
  open,
  team = null,
  week = null,
  onClose,
  onSave,
  onSaved,
  pending = false,
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

  const canSave = Boolean(
    onSave &&
    initial?.teamId &&
    initial?.weekId &&
    initial?.dayKey &&
    isValid &&
    isDirty &&
    !pending
  )

  const handleReset = () => {
    setDraft(initial)
  }

  const handleSave = async () => {
    if (!canSave) return

    if (!onSave) return

    await onSave(
      patch,
      {
        section: 'training',
        teamId: initial.teamId,
        createIfMissing: true,
      }
    )

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
          <Box sx={{ py: 0.5, px: 1 }}>
            <TrainingDayEditFields
              draft={draft}
              layout={layout}
              onDraft={setDraft}
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
