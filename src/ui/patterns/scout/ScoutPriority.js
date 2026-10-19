// src/ui/patterns/scout/ScoutPriority.js
import * as React from 'react'
import {
  Box,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'
import {
  resolveScoutPriority,
  scoutPriorityColors,
  scoutPrioritySx as sx,
} from './scoutPriority.presentation.js'
import ScoutPriorityDetails from './ScoutPriorityDetails.js'

export { scoutPriorityColors }

export default function ScoutPriority({
  value,
  label,
  short = false,
  tooltip,
  fontSize = 13,
  number,
  details,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [detailsMounted, setDetailsMounted] = React.useState(false)
  const detailsId = React.useId()
  const meta = resolveScoutPriority(value)
  const colors = meta.colors
  const fullLabel = label || meta.label
  const displayLabel = short ? meta.shortLabel : fullLabel
  const tooltipLabel = tooltip || fullLabel
  const tooltipTitle = React.isValidElement(tooltipLabel)
    ? tooltipLabel
    : <Box sx={sx.tooltipContent}>{tooltipLabel}</Box>
  const hasNumber = typeof number === 'number' && Number.isFinite(number)

  const badge = (
    <Box
      component={details ? 'button' : 'span'}
      type={details ? 'button' : undefined}
      data-scout-priority={details ? '' : undefined}
      aria-label={details ? `הסבר ${details.title}${details.context ? ` · ${details.context}` : ''}` : undefined}
      aria-haspopup={details ? 'dialog' : undefined}
      aria-expanded={details ? Boolean(anchorEl) : undefined}
      aria-controls={details && anchorEl ? detailsId : undefined}
      onClick={details ? event => {
        event.stopPropagation()
        setDetailsMounted(true)
        setAnchorEl(event.currentTarget)
      } : undefined}
      onKeyDown={details ? event => event.stopPropagation() : undefined}
      sx={[sx.root({ colors, fontSize }), details && sx.interactive, anchorEl && sx.selected(colors)]}
    >
      {iconUi({
        id: meta.iconId,
        size: 'sm',
        sx: sx.icon({ colors, fontSize }),
      })}

      <Typography component='span' sx={sx.label({ colors, fontSize })}>
        {displayLabel}
      </Typography>
      {hasNumber ? (
        <Typography component='span' sx={sx.number({ colors, fontSize })}>
          {number}
        </Typography>
      ) : null}
    </Box>
  )

  if (!details) return <Tooltip title={tooltipTitle} arrow>{badge}</Tooltip>

  return (
    <>
      {badge}
      <ScoutPriorityDetails
        id={detailsId}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        details={details}
        meta={meta}
        renderContent={detailsMounted}
      />
    </>
  )
}
