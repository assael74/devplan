import React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'
import { collapseBoxSx as sx } from './collapseBox.sx.js'

function handleCollapseKeyDown(event, onToggle) {
  if (event.key !== 'Enter' && event.key !== ' ') return

  event.preventDefault()
  onToggle?.(event)
}

export default function CollapseBox({
  open = false,
  onToggle,
  title,
  subtitle,
  headerLeft,
  headerRight,
  children,
  iconId = 'arrowDown',
  rootSx,
  headerSx,
  indicatorSx,
  contentSx,
  innerSx,
}) {
  const titleNode = headerLeft || (
    <Box sx={sx.headerText}>
      {title ? <Typography sx={sx.title}>{title}</Typography> : null}
      {subtitle ? <Typography sx={sx.subtitle}>{subtitle}</Typography> : null}
    </Box>
  )

  return (
    <Box sx={[sx.root, rootSx]}>
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={open}
        sx={[sx.header(open), headerSx]}
        onClick={onToggle}
        onKeyDown={event => handleCollapseKeyDown(event, onToggle)}
      >
        <Box sx={sx.headerLeft}>
          {titleNode}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
          {headerRight ? <Box>{headerRight}</Box> : null}

          <Box sx={[sx.indicator(open), indicatorSx]}>
            {iconUi({ id: iconId, size: 'sm' })}
          </Box>
        </Box>
      </Box>

      <Box sx={[sx.content(open), contentSx]}>
        <Box sx={[sx.inner, innerSx]}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
