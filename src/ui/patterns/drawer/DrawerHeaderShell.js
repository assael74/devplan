// ui/patterns/drawer/DrawerHeaderShell.js

import React from 'react'
import {
  Box,
  Typography,
  DialogTitle,
  ModalClose,
  Chip,
  Avatar,
} from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'
import { headerSx as sx } from './sx/header.sx.js'

export default function DrawerHeaderShell({
  title,
  subline,
  titleIconId = 'task',
  avatar,
  entity,

  meta,
  metaIconId,

  chipLabel,
  chipColor,
  chipIconId,

  closeDisabled = false,
  sxOverrides = {},
}) {
  return (
    <DialogTitle
      sx={{
        ...sx.header(entity),
        ...(sxOverrides.header || {}),
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, minWidth: 0 }}>
        {avatar ? (
          <Avatar src={avatar} />
        ) : (
          <Box sx={sxOverrides.icon || {}}>
            {iconUi({ id: titleIconId })}
          </Box>
        )}

        <Box sx={{ ml: 2, minWidth: 0 }}>
          {chipLabel ? (
            <Chip
              size="sm"
              variant="soft"
              startDecorator={chipIconId ? iconUi({ id: chipIconId, size: 'sm' }) : null}
              sx={{
                ...sx.headerChip(chipColor),
                ...(sxOverrides.chip || {}),
              }}
            >
              {chipLabel}
            </Chip>
          ) : null}

          <Typography
            level="title-md"
            sx={{
              ...sx.title,
              ...(sxOverrides.title || {}),
            }}
          >
            {title || 'עריכה'}
          </Typography>

          {subline ? (
            <Typography
              level="body-sm"
              sx={{
                ...sx.subline,
                ...(sxOverrides.subline || {}),
              }}
            >
              {subline}
            </Typography>
          ) : null}

          {meta ? (
            <Box sx={sx.boxMeta}>
              <Typography
                level="body-xs"
                sx={{
                  ...sx.meta,
                  ...(sxOverrides.meta || {}),
                }}
                startDecorator={metaIconId ? iconUi({ id: metaIconId }) : null}
              >
                {meta}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Box>

      <ModalClose
        disabled={closeDisabled}
        sx={sxOverrides.close || {}}
      />
    </DialogTitle>
  )
}
