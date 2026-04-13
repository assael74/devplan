// ui/patterns/drawer/DrawerHeader.js

import React from 'react'
import { Box, Typography, DialogTitle, ModalClose, Chip, Avatar } from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'
import { headerSx as sx } from './sx/header.sx.js'
import { getEntityColors } from '../../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

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
}) {
  return (
    <DialogTitle sx={{ bgcolor: c(entity).bg, borderRadius: 'sm', p: 1 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {avatar ? (
          <Avatar src={avatar} />
        ) : (
          iconUi({ id: titleIconId })
        )}

        <Box sx={{ ml: 2 }}>
          <Typography level="title-md" sx={sx.title}>
            {title || 'עריכה'}
          </Typography>

          {subline ? (
            <Typography level="body-sm" sx={sx.subline}>
              {subline}
            </Typography>
          ) : null}

          {meta || chipLabel ? (
            <Box sx={sx.boxMeta}>
              {meta ? (
                <Typography level="body-xs" sx={sx.meta} startDecorator={metaIconId ? iconUi({ id: metaIconId }) : null}>
                  {meta}
                </Typography>
              ) : null}

              {chipLabel ? (
                <Chip
                  size="sm"
                  variant="soft"
                  startDecorator={chipIconId ? iconUi({ id: chipIconId, size: 'sm' }) : null}
                  sx={sx.headerChip(chipColor)}
                >
                  {chipLabel}
                </Chip>
              ) : null}
            </Box>
          ) : null}
        </Box>
      </Box>

      <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
    </DialogTitle>
  )
}
