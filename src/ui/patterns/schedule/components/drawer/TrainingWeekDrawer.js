// ui/patterns/schedule/components/drawer/TrainingWeekDrawer.js

import React, { useMemo, useState, useEffect } from 'react'
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

import TrainingCreateFields from '../../../../forms/ui/trainings/TrainingCreateFields.js'

import { useTeamHubUpdate } from '../../../../../features/hub/hooks/teams/useTeamHubUpdate.js'
import { iconUi } from '../../../../core/icons/iconUi.js'
import { trainingWeekDrawerSx as sx } from '../../sx/trainingWeekDrawer.sx.js'
import { getEntityColors } from '../../../../core/theme/Colors.js'

import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from './logic/trainingWeekDrawer.logic.js'

const c = getEntityColors('training')

export default function TrainingWeekDrawer({
  open,
  team,
  context,
  onClose,
  onSaved,
  title = 'יצירת שבוע אימונים',
  subtitle = 'הגדרת ימים, עומס ותוכן שבועי',
}) {
  const initial = useMemo(() => buildInitialDraft(team), [team])
  const [draft, setDraft] = useState(initial)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
    setIsValid(false)
  }, [open, initial])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildPatch(draft, initial), [draft, initial])

  const { run, pending } = useTeamHubUpdate(team)
  const canSave = Boolean(initial?.id && isValid && isDirty && !pending)

  const handleSave = async () => {
    if (!canSave) return

    await run('training', patch, {
      section: 'training',
      teamId: initial.id,
      createIfMissing: true,
    })

    onSaved(patch, draft)
    onClose()
  }

  const handleReset = () => {
    setDraft(initial)
  }

  return (
    <Drawer
      size="lg"
      variant="plain"
      anchor='right'
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
            </Box>
          </Box>

          <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
        </DialogTitle>

        <DialogContent sx={{ gap: 2 }}>
          <Box sx={sx.content} className="dpScrollThin">
            <TrainingCreateFields
              team={team}
              draft={draft}
              onDraft={setDraft}
              onValidChange={setIsValid}
              context={context}
              mode="drawer"
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
