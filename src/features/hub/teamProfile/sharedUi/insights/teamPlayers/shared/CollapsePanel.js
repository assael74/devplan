// TEAMPROFILE/sharedUi/insights/teamPlayers/shared/CollapsePanel.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { collapseSx as sx } from './sx/collapse.sx.js'

export default function CollapsePanel({
  icon = 'insights',
  title,
  sub,
  children,
  defaultOpen = false,
  tone = 'primary',
}) {
  const [open, setOpen] = React.useState(defaultOpen)

  const toggle = () => {
    setOpen(value => !value)
  }

  const onKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggle()
    }
  }

  return (
    <Box sx={sx.panel(tone)}>
      <Box
        role="button"
        tabIndex={0}
        sx={sx.head(open)}
        onClick={toggle}
        onKeyDown={onKeyDown}
      >
        <Box sx={sx.titleWrap}>
          <Box sx={sx.icon(tone)}>
            {iconUi({ id: icon })}
          </Box>

          <Box sx={sx.text}>
            <Typography level="title-sm" sx={sx.title}>
              {title}
            </Typography>

            {sub ? (
              <Typography level="body-xs" sx={sx.sub}>
                {sub}
              </Typography>
            ) : null}
          </Box>
        </Box>

        <Box sx={sx.toggle(open)}>
          {iconUi({ id: 'arrowDown', size: 'lg' })}
        </Box>
      </Box>

      <Box sx={sx.collapse(open)}>
        <Box sx={sx.collapseInner}>
          <Box sx={sx.body}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
