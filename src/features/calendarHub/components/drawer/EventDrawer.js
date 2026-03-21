// src/features/calendar/components/drawer/EventDrawer.js

import React, { useMemo } from 'react'
import { Drawer, Sheet, Box, Button, Typography, DialogContent, Tooltip, IconButton } from '@mui/joy'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import EventHeaderDrawer from './EventHeaderDrawer.js'
import EventContentDrawer from './EventContentDrawer.js'
import { drawerSx as sx } from './sx/drawer.sx.js'

function isDraftValid(draft) {
  if (!draft?.type) return false
  if (!draft?.calendarId) return false
  if (!draft?.title?.trim()) return false
  if (!draft?.date) return false
  if (draft?.type === 'match' && !draft?.time) return false
  return true
}

function isDraftDirty(draft, initialDraft) {
  return JSON.stringify(draft || {}) !== JSON.stringify(initialDraft || {})
}

export default function EventDrawer({
  open,
  onClose,
  draft,
  onDraft,
  initialDraft,
  calendars = [],
  mode = 'create',
  onSave,
  onDelete,
}) {
  const isValid = useMemo(() => isDraftValid(draft), [draft])
  const isDirty = useMemo(() => isDraftDirty(draft, initialDraft), [draft, initialDraft])

  function handleSave() {
    if (!isValid) return
    onSave(draft)
  }

  function handleReset() {
    onDraft(initialDraft)
  }

  function handleDelete() {
    onDelete(draft)
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
        <EventHeaderDrawer draft={draft} mode={mode} onClose={onClose} />

        <DialogContent sx={{ gap: 2, minHeight: 0 }}>
          <Box sx={sx.content} className="dpScrollThin">
            <EventContentDrawer
              draft={draft}
              onDraft={onDraft}
              calendars={calendars}
            />
          </Box>
        </DialogContent>

        <Box sx={sx.footerSx}>
          <Box sx={sx.footerActionsSx}>
            <Button
              disabled={!isValid}
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
            >
              ביטול
            </Button>

            <Tooltip title="איפוס השינויים">
              <span>
                <IconButton
                  disabled={!isDirty}
                  size="sm"
                  variant="soft"
                  sx={sx.icoRes}
                  onClick={handleReset}
                >
                  {iconUi({ id: 'reset' })}
                </IconButton>
              </span>
            </Tooltip>

            {mode === 'edit' ? (
              <Tooltip title="מחיקת אירוע">
                <span>
                  <IconButton
                    size="sm"
                    color="danger"
                    variant="solid"
                    onClick={handleDelete}
                  >
                    {iconUi({ id: 'delete' })}
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}
          </Box>

          <Typography level="body-xs" color={!isValid ? 'warning' : isDirty ? 'danger' : 'neutral'}>
            {!isValid ? 'יש שדות חובה חסרים' : isDirty ? 'יש שינויים שלא נשמרו' : 'אין שינויים'}
          </Typography>
        </Box>
      </Sheet>
    </Drawer>
  )
}
