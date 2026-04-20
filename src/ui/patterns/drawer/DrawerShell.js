// ui/patterns/drawer/DrawerShell.js

import React from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { Drawer, Sheet, Box, Typography, Button, IconButton, Tooltip, DialogContent } from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'
import { drawerSx as sx } from './sx/drawer.sx.js'

export default function DrawerShell({
  open,
  onClose,

  header,
  children,
  entity,

  anchor = 'right',
  size = 'md',

  saving = false,
  isDirty = false,
  canSave = false,

  actions = {},
  texts = {},
  tooltips = {},
  status = {},

  saveIconId = 'save',

  saveButtonProps = {},
  cancelButtonProps = {},
  resetButtonProps = {},
  deleteButtonProps = {},
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const {
    onSave,
    onReset,
    onDelete,
  } = actions

  const {
    save = 'שמירה',
    saving: savingLabel = 'שומר...',
    cancel = 'ביטול',
    statusSaving = 'שומר עדכון...',
    statusDirty = 'יש שינויים שלא נשמרו',
    statusClean = 'אין שינויים',
  } = texts

  const {
    reset = 'איפוס טופס',
    delete: deleteLabel = 'מחיקה',
  } = tooltips

  const closeHandler = saving ? undefined : onClose

  const defaultStatusText = saving ? statusSaving : isDirty ? statusDirty : statusClean
  const defaultStatusColor = isDirty ? 'danger' : 'neutral'

  const statusText = status?.text || defaultStatusText
  const statusColor = status?.color || defaultStatusColor

  return (
    <Drawer
      open={!!open}
      size={size}
      anchor={anchor}
      onClose={closeHandler}
      slotProps={{
        content: { sx: sx.root(isMobile), },
      }}
    >
      <Sheet sx={sx.sheet}>
        {header ? <Box>{header}</Box> : null}

        <DialogContent>
          <Box sx={sx.content} className="dpScrollThin">
            {children}
          </Box>
        </DialogContent>

        <Box sx={sx.footer}>
          <Box sx={sx.footerActions}>
            <Button
              loading={saving}
              loadingPosition="start"
              disabled={!canSave}
              startDecorator={!saving ? iconUi({ id: saveIconId }) : null}
              onClick={onSave}
              sx={sx.conBut(entity)}
              {...saveButtonProps}
            >
              {saving ? savingLabel : save}
            </Button>

            <Button
              color="neutral"
              variant="outlined"
              onClick={onClose}
              disabled={saving}
              {...cancelButtonProps}
            >
              {cancel}
            </Button>

            {onReset ? (
              <Tooltip title={reset}>
                <span>
                  <IconButton
                    disabled={!isDirty || saving}
                    size="sm"
                    variant="soft"
                    sx={sx.icoRes}
                    onClick={onReset}
                    {...resetButtonProps}
                  >
                    {iconUi({ id: 'reset' })}
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}

            {onDelete ? (
              <Tooltip title={deleteLabel}>
                <span>
                  <IconButton
                    size="sm"
                    color="danger"
                    variant="solid"
                    onClick={onDelete}
                    disabled={saving}
                    {...deleteButtonProps}
                  >
                    {iconUi({ id: 'delete' })}
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}
          </Box>

          <Typography level="body-xs" color={statusColor}>
            {statusText}
          </Typography>
        </Box>
      </Sheet>
    </Drawer>
  )
}
