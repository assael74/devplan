// preview/previewDomainCard/domains/team/videos/components/TeamVideosRow.js

import React from 'react'
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { tableSx as sx } from '../sx/teamVideosTable.sx.js'

export default function TeamVideosRow({
  row,
  onWatch,
  onEdit,
  onLink,
  onShare,
}) {
  const tagsFull = Array.isArray(row?.tagsFull) ? row.tagsFull : []
  const tagsPreview = tagsFull
    .slice(0, 2)
    .map((t) => t?.tagName || t?.label || 'תג')
    .filter(Boolean)
    .join(' · ')

  return (
    <Box sx={sx.rowCardSx}>
      <Box sx={sx.mainCellSx}>
        <Typography level="body-sm" sx={sx.mainValueSx}>
          {row?.dateLabel || '—'}
        </Typography>
        <Typography sx={sx.subValueSx}>
          {row?.monthLabel || '—'}
        </Typography>
      </Box>

      <Box sx={sx.mainCellSx}>
        <Typography level="body-sm" sx={sx.mainValueSx}>
          {row?.title || '—'}
        </Typography>
        <Typography sx={sx.subValueSx}>
          {row?.notes || 'ללא הערה'}
        </Typography>
      </Box>

      <Box sx={sx.mainCellSx}>
        <Typography level="body-sm" sx={sx.mainValueSx}>
          {row?.playerName || 'ללא שיוך'}
        </Typography>
        <Typography sx={sx.subValueSx}>
          {row?.isKey ? 'שחקן מפתח' : 'שחקן'}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Chip size="sm" variant="soft" color={row?.isKey ? 'warning' : 'neutral'}>
          {row?.isKey ? 'מפתח' : 'רגיל'}
        </Chip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title={tagsPreview || 'אין תגים'}>
          <Chip
            size="sm"
            variant="soft"
            color={row?.tagsCount > 0 ? 'success' : 'neutral'}
          >
            {row?.tagsCount > 0 ? `${row.tagsCount} תגים` : 'ללא תיוג'}
          </Chip>
        </Tooltip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title={row?.hasLink ? 'יש קישור לוידאו' : 'אין קישור'}>
          <Chip
            size="sm"
            variant="soft"
            color={row?.hasLink ? 'success' : 'danger'}
            startDecorator={iconUi({ id: row?.hasLink ? 'video' : 'noLink', size: 'sm' })}
          >
            {row?.hasLink ? 'קיים' : 'חסר'}
          </Chip>
        </Tooltip>
      </Box>

      <Box sx={sx.actionsCellSx}>
        <Tooltip title="צפייה">
          <span>
            <IconButton size="sm" variant="soft" onClick={onWatch} disabled={!onWatch}>
              {iconUi({ id: 'video', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="עריכה">
          <span>
            <IconButton size="sm" variant="soft" onClick={onEdit} disabled={!onEdit}>
              {iconUi({ id: 'edit', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="קישור">
          <span>
            <IconButton size="sm" variant="soft" onClick={onLink} disabled={!onLink}>
              {iconUi({ id: 'addLink', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="שיתוף">
          <span>
            <IconButton size="sm" variant="soft" onClick={onShare} disabled={!onShare}>
              {iconUi({ id: 'share', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  )
}
