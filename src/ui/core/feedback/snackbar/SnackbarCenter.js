// src/ui/snackbar/SnackbarCenter.js
import React, { useEffect, useMemo } from 'react'
import Snackbar from '@mui/joy/Snackbar'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Chip from '@mui/joy/Chip'
import Button from '@mui/joy/Button'
import IconButton from '@mui/joy/IconButton'

import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import ErrorRounded from '@mui/icons-material/ErrorRounded'
import CloseRounded from '@mui/icons-material/CloseRounded'
import ReplayRounded from '@mui/icons-material/ReplayRounded'

import { useSnackbar } from './SnackbarProvider.js'
import { buildMainLine, buildTitle, getActionLabel, getEntityLabel, getActionIdIcon, getActionColor, getEntityColor } from './snackbar.format.js'
import { SNACK_STATUS } from './snackbar.model.js'

import { iconUi } from '../../icons/iconUi.js'

const iconFor = (status) => (status === SNACK_STATUS.SUCCESS ? CheckCircleRounded : ErrorRounded)

export default function SnackbarCenter({ anchorOrigin }) {
  const { active, closeActive, retryActive } = useSnackbar()

  const open = !!active
  const status = active?.status || SNACK_STATUS.SUCCESS

  const Icon = useMemo(() => iconFor(status), [status])

  const title = active?.title || buildTitle(status)
  const mainLine = active?.message || buildMainLine(active || {})
  const details = active?.details || null

  const showChips = active?.showChips !== false
  const actionChip = active?.action ? getActionLabel(active.action) : null
  const entityChip = active?.entityType ? getEntityLabel(active.entityType) : null
  const entityIcon = active?.entityType ? active?.entityType : null
  const actionIcon = active?.action ? getActionIdIcon(active.action) : null
  const actionColor = active?.action ? getActionColor(active.action) : null
  const entityColor = active?.action ? getEntityColor(active.entityType) : null

  const durationMs = Number.isFinite(active?.durationMs) ? active.durationMs : 3200
  // no auto-hide: user closes explicitly

  return (
    <Snackbar
      open={open}
      onClose={() => closeActive('close')}
      anchorOrigin={anchorOrigin || { vertical: 'bottom', horizontal: 'left' }}
      variant="soft"
      autoHideDuration={null}
      color={status === SNACK_STATUS.SUCCESS ? 'success' : 'danger'}
      sx={{
        maxWidth: 700,
        minWidth: 600,
        direction: 'rtl',
        borderRadius: 16,
        boxShadow: 'lg',
        border: '1px solid',
        borderColor: status === SNACK_STATUS.SUCCESS ? 'success.outlinedBorder' : 'danger.outlinedBorder',
        bgcolor: status === SNACK_STATUS.SUCCESS ? 'success.softBg' : 'danger.softBg',
        zIndex: 2000,
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', width: '100%' }}>
        <Box sx={{ mt: 0.25, flexShrink: 0 }}>
          <Icon sx={{ fontSize: 34 }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography level="title-md" sx={{ mb: 0.25, textAlign: 'left' }}>
            {title}
          </Typography>

          <Typography level="body-md" sx={{ mb: details ? 0.5 : 0.25, wordBreak: 'break-word', textAlign: 'left' }}>
            {mainLine}
          </Typography>

          {!!details && (
            <Typography level="body-xs" sx={{ opacity: 0.85, wordBreak: 'break-word', textAlign: 'left' }}>
              {details}
            </Typography>
          )}

          {showChips && (actionChip || entityChip) && (
            <Box sx={{ display: 'flex', gap: 0.75, mt: 0.75, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {!!actionChip && <Chip size="sm" variant="solid" color={actionColor} startDecorator={iconUi({id: actionIcon})}>{actionChip}</Chip>}
              {!!entityChip &&
                <Chip
                  size="sm"
                  variant="solid"
                  startDecorator={iconUi({ id: entityIcon })}
                  sx={{
                    bgcolor: entityColor,
                    color: '#111827',
                    fontWeight: 700,
                    '--Chip-radius': '10px',
                    '& svg': {
                      fill: 'currentColor',
                    },
                  }}
               >
                {entityChip}
              </Chip>
              }
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
          {typeof active?.onRetry === 'function' && status === SNACK_STATUS.ERROR && (
            <Button
              size="sm"
              variant="soft"
              startDecorator={<ReplayRounded />}
              onClick={retryActive}
            >
              נסה שוב
            </Button>
          )}

          <IconButton size="sm" variant="plain" onClick={() => closeActive('x')}>
            <CloseRounded />
          </IconButton>
        </Box>
      </Box>
    </Snackbar>
  )
}
