// src/features/liveTagging/ui/LiveActionsSettingsDrawer.js

import React from 'react'
import {
  Box,
  Button,
  Checkbox,
  Drawer,
  ModalClose,
  Typography,
} from '@mui/joy'

import { LIVE_ACTION_PAIRS } from '../../../shared/liveTagging/index.js'
import { iconUi } from '../../../ui/core/icons/iconUi.js'
import { sx } from './sx/liveTagging.sx.js'

export function LiveActionsSettingsDrawer({
  open,
  selectedActionPairIds = [],
  onClose,
  onToggleAction,
  onResetActions,
}) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        content: {
          sx: sx.actionsSettingsDrawer,
        },
      }}
    >
      <ModalClose />

      <Box sx={sx.actionsSettingsHead}>
        <Typography level="title-md">
          בחירת פעולות לתצוגה
        </Typography>

        <Typography level="body-sm" sx={sx.mutedText}>
          בחר אילו פעולות יופיעו במסך התיוג המהיר.
        </Typography>

        <Button
          size="sm"
          variant="soft"
          color="neutral"
          onClick={onResetActions}
          sx={sx.actionsSettingsReset}
        >
          ברירת מחדל
        </Button>
      </Box>

      <Box sx={sx.actionsSettingsList}>
        {LIVE_ACTION_PAIRS.map((action) => {
          const checked = selectedActionPairIds.includes(action.id)

          return (
            <Box key={action.id} sx={sx.actionsSettingsRow}>
              <Box sx={sx.actionsSettingsInfo}>
                {action.idIcon && iconUi({ id: action.idIcon, size: 'sm' })}

                <Box>
                  <Typography level="body-sm" sx={sx.actionsSettingsTitle}>
                    {action.label}
                  </Typography>

                  <Typography level="body-xs" sx={sx.mutedText}>
                    {action.positiveLabel || '-'} / {action.negativeLabel || '-'}
                  </Typography>
                </Box>
              </Box>

              <Checkbox
                size="sm"
                checked={checked}
                onChange={() => onToggleAction(action.id)}
              />
            </Box>
          )
        })}
      </Box>
    </Drawer>
  )
}
