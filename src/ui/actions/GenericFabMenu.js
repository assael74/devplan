// ui/actions/GenericFabMenu.js

import * as React from 'react'
import Box from '@mui/joy/Box'
import Divider from '@mui/joy/Divider'
import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import Tooltip from '@mui/joy/Tooltip'
import Typography from '@mui/joy/Typography'

import { getEntityColors } from '../core/theme/Colors'
import AddRounded from '@mui/icons-material/AddRounded'
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded'
import { sxFabMenu } from './GenericFabMenu.sx'

const POS = {
  br: { left: { xs: 14, md: 22 }, bottom: { xs: 14, md: 22 } },
  bl: { right: { xs: 14, md: 22 }, bottom: { xs: 14, md: 22 } },
  tr: { left: { xs: 14, md: 22 }, top: { xs: 14, md: 22 } },
  tl: { right: { xs: 14, md: 22 }, top: { xs: 14, md: 22 } },
}

const safeColors = (k) => {
  try {
    return k ? getEntityColors(k) : null
  } catch {
    return null
  }
}

const isDividerItem = (item) => item?.type === 'divider'

export default function GenericFabMenu({
  id = 'fab-menu',
  placement = 'br',
  tooltip = 'פתיחת פעולות',
  ariaLabel = 'פתיחת פעולות',
  actions = [],
  disabled = false,
  showLabel = false,
  label = '',
  primaryIcon,
  entityType,
  fabSx,
}) {
  const [open, setOpen] = React.useState(false)

  const palette = React.useMemo(() => safeColors(entityType), [entityType])
  const visible = React.useMemo(() => actions.filter((a) => !a?.hidden), [actions])
  const hasMenu = visible.length > 0

  const Icon = primaryIcon || AddRounded

  const Trigger = (
    <Box sx={sxFabMenu.trigger}>
      {showLabel && label ? (
        <Typography level="body-sm" sx={sxFabMenu.label(palette)}>
          {label}
        </Typography>
      ) : null}

      <MenuButton
        id={id}
        aria-label={ariaLabel}
        disabled={disabled || !hasMenu}
        variant="plain"
        sx={[sxFabMenu.fab(open, palette), fabSx]}
      >
        {open ? <KeyboardArrowUpRounded /> : <Icon />}
      </MenuButton>
    </Box>
  )

  return (
    <Box sx={{ position: 'fixed', zIndex: 1200, ...(POS[placement] || POS.br) }}>
      <Dropdown open={open} onOpenChange={(_, v) => setOpen(v)}>
        {tooltip ? <Tooltip title={tooltip}>{Trigger}</Tooltip> : Trigger}

        {hasMenu ? (
          <Menu placement="top-end" sx={sxFabMenu.menu}>
            {visible.map((a, i) => {
              if (isDividerItem(a)) {
                return <Divider key={a.id || `divider-${i}`} inset="none" />
              }

              const c = safeColors(a.color)

              return (
                <MenuItem
                  key={a.id || i}
                  disabled={a.disabled}
                  onClick={() => {
                    setOpen(false)
                    a.onClick?.()
                  }}
                  sx={sxFabMenu.menuItem(c)}
                >
                  {a.icon ? <ListItemDecorator>{a.icon}</ListItemDecorator> : null}
                  {a.label || a.title}
                </MenuItem>
              )
            })}
          </Menu>
        ) : null}
      </Dropdown>
    </Box>
  )
}
