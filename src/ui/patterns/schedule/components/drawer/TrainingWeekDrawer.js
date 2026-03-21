// ui/patterns/schedule/components/drawer/TrainingWeekDrawer.js

import React from 'react'
import Drawer from '@mui/joy/Drawer'
import Sheet from '@mui/joy/Sheet'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import IconButton from '@mui/joy/IconButton'

import TrainingWeekCreateForm from '../../../../forms/TrainingWeekCreateForm.js'
import { upsertTrainingWeek } from '../../../../../services/firestore/shorts/trainings/trainingsShorts.service.js'
import { useSnackbar } from '../../../../core/feedback/snackbar/SnackbarProvider'
import { SNACK_ACTION, SNACK_STATUS } from '../../../../core/feedback/snackbar/snackbar.model'
import { mapFirestoreErrorToDetails } from '../../../../core/feedback/snackbar/snackbar.format'
import { iconUi } from '../../../../core/icons/iconUi.js'
import { trainingWeekDrawerSx as sx } from '../../sx/trainingWeekDrawer.sx.js'

const EMPTY_DRAFT = {}

function buildInitialDraft(teamId = '', seed = EMPTY_DRAFT) {
  return {
    teamId: String(seed?.teamId || teamId || '').trim(),
    weekId: String(seed?.weekId || '').trim(),
    notes: seed?.notes || '',
    defaults: seed?.defaults || {},
    days: Array.isArray(seed?.days) ? seed.days : [],
    ...seed,
  }
}

export default function TrainingWeekDrawer({
  open = false,
  onClose,
  onDone,
  teamId = '',
  initialDraft = EMPTY_DRAFT,
  context = {},
  width = 620,
  anchor = 'right',
  title = 'יצירת שבוע אימונים',
  subtitle = 'הגדרת ימים, עומס ותוכן שבועי',
}) {
  const { notify } = useSnackbar()

  const [draft, setDraft] = React.useState(() => buildInitialDraft(teamId, initialDraft))
  const [isValid, setIsValid] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const wasOpenRef = React.useRef(false)

  React.useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(buildInitialDraft(teamId, initialDraft))
      setIsValid(false)
      setBusy(false)
    }

    wasOpenRef.current = open
  }, [open, teamId, initialDraft])

  const handleDraft = React.useCallback((patch) => {
    setDraft((prev) => ({ ...prev, ...(patch || {}) }))
  }, [])

  const handleReset = React.useCallback(() => {
    if (busy) return
    setDraft(buildInitialDraft(teamId, initialDraft))
    setIsValid(false)
  }, [busy, teamId, initialDraft])

  const handleClose = React.useCallback(() => {
    if (busy) return
    if (onClose) onClose()
  }, [busy, onClose])

  const handleSave = React.useCallback(async () => {
    const safeTeamId = String(draft?.teamId || teamId || '').trim()
    const safeWeekId = String(
      draft?.weekId || draft?.weekKey || draft?.weekStartDate || ''
    ).trim()

    if (!safeTeamId || !safeWeekId) return

    try {
      setBusy(true)

      const payload = {
        ...draft,
        teamId: safeTeamId,
        weekId: safeWeekId,
      }

      const res = await upsertTrainingWeek({
        draft: payload,
        context,
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        action: SNACK_ACTION.CREATE,
        entityType: 'training',
        entityName: safeWeekId,
      })

      if (onDone) onDone(res)
      if (onClose) onClose()
    } catch (e) {
      notify({
        status: SNACK_STATUS.ERROR,
        action: SNACK_ACTION.CREATE,
        entityType: 'training',
        entityName: safeWeekId || null,
        details: mapFirestoreErrorToDetails(e),
      })

      console.error('[TrainingWeekDrawer] save failed', e)
    } finally {
      setBusy(false)
    }
  }, [draft, teamId, context, notify, onDone, onClose])

  return (
    <Drawer
      open={!!open}
      onClose={handleClose}
      anchor={anchor}
      size="md"
      slotProps={{ content: { sx: sx.drawer(width) } }}
    >
      <Sheet sx={sx.shell}>
        <Box sx={sx.header}>
          <Box sx={sx.headerLeft}>
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

          <IconButton
            size="sm"
            variant="plain"
            disabled={!!busy}
            onClick={handleClose}
            aria-label="סגור"
          >
            {iconUi({ id: 'close' })}
          </IconButton>
        </Box>

        <Box sx={sx.body} className="dpScrollThin">
          <TrainingWeekCreateForm
            draft={draft}
            onDraft={handleDraft}
            onValidChange={setIsValid}
            context={context}
            mode="drawer"
          />
        </Box>

        <Box sx={sx.footer}>
          <Box sx={sx.footerRight}>
            <Button
              size="sm"
              variant="solid"
              disabled={!isValid || !!busy}
              loading={!!busy}
              startDecorator={iconUi({ id: 'save' })}
              sx={sx.conBut}
              onClick={handleSave}
            >
              שמירה
            </Button>

            <Button
              size="sm"
              variant="soft"
              disabled={!!busy}
              startDecorator={iconUi({ id: 'reset' })}
              onClick={handleReset}
            >
              איפוס
            </Button>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Button size="sm" variant="plain" disabled={!!busy} onClick={handleClose}>
            סגור
          </Button>
        </Box>
      </Sheet>
    </Drawer>
  )
}
