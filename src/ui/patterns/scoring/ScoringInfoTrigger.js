// src/ui/patterns/scoring/ScoringInfoTrigger.js

import React from 'react'
import Box from '@mui/joy/Box'
import Dropdown from '@mui/joy/Dropdown'
import IconButton from '@mui/joy/IconButton'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import Tooltip from '@mui/joy/Tooltip'
import Typography from '@mui/joy/Typography'
import CloseRounded from '@mui/icons-material/CloseRounded'
import useMediaQuery from '@mui/material/useMediaQuery'

import { iconUi } from '../../core/icons/iconUi.js'
import { tooltipSx as sx } from './sx/tooltip.sx.js'

const stopEvent = event => {
  event.preventDefault()
  event.stopPropagation()
}

const stopOnly = event => {
  event.stopPropagation()
}

export default function ScoringInfoTrigger({
  children,
  content,
  title,
  subtitle,
  size = 'sm',
  placement = 'top',
  iconSize = 16,
  triggerSx,
  tooltipVariant = 'outlined',
  mobileQuery = '(max-width: 899px)',
}) {
  const isMobile = useMediaQuery(mobileQuery)
  const [open, setOpen] = React.useState(false)

  if (!content) return children || null

  if (!isMobile) {
    const trigger = children ? (
      <Box
        component="span"
        sx={{
          ...sx.childTrigger,
          ...triggerSx,
        }}
      >
        {children}
      </Box>
    ) : (
      <IconButton size={size} variant="plain" sx={sx.trigger}>
        {iconUi({ id: 'info', size: iconSize })}
      </IconButton>
    )

    return (
      <Tooltip
        arrow
        variant={tooltipVariant}
        placement={placement}
        title={content}
      >
        {trigger}
      </Tooltip>
    )
  }

  const triggerSlots = children
    ? { root: Box }
    : { root: IconButton }

  const triggerSlotProps = children
    ? {
        root: {
          component: 'span',
          onClick: stopOnly,
          onMouseDown: stopEvent,
          onTouchStart: stopOnly,
          sx: {
            ...sx.childTrigger,
            cursor: 'pointer',
            ...triggerSx,
          },
        },
      }
    : {
        root: {
          size,
          variant: 'plain',
          onClick: stopOnly,
          onMouseDown: stopEvent,
          onTouchStart: stopOnly,
          sx: {
            ...sx.trigger,
            ...triggerSx,
          },
        },
      }

  return (
    <Dropdown
      open={open}
      onOpenChange={(_, isOpen) => setOpen(isOpen)}
    >
      {open ? (
        <Box
          sx={sx.infoMenuBackdrop}
          onClick={event => {
            stopOnly(event)
            setOpen(false)
          }}
          onMouseDown={stopOnly}
          onTouchStart={stopOnly}
        />
      ) : null}

      <MenuButton
        slots={triggerSlots}
        slotProps={triggerSlotProps}
      >
        {children || iconUi({ id: 'info', size: iconSize })}
      </MenuButton>

      <Menu
        variant="outlined"
        placement="bottom"
        onClick={stopOnly}
        onMouseDown={stopOnly}
        onTouchStart={stopOnly}
        sx={sx.infoMenuCentered}
      >
        <Box sx={sx.infoMenuTop}>
          {(title || subtitle) ? (
            <Box sx={sx.infoMenuHead}>
              {title ? (
                <Typography level="title-sm" sx={sx.infoMenuTitle}>
                  {title}
                </Typography>
              ) : null}

              {subtitle ? (
                <Typography level="body-xs" sx={sx.infoMenuSubtitle}>
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
          ) : (
            <Box sx={{ flex: 1 }} />
          )}

          <IconButton
            size="sm"
            variant="plain"
            color="neutral"
            onClick={event => {
              stopEvent(event)
              setOpen(false)
            }}
            sx={sx.infoMenuClose}
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={sx.infoMenuBody}>
          {content}
        </Box>
      </Menu>
    </Dropdown>
  )
}
