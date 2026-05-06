// ui/patterns/insights/ui/MenuInfo.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'

import { menuInfoSx as sx } from './sx/menuInfo.sx.js'

export default function MenuInfo({
  items = [],
  color = 'neutral',
  buttonText = 'למה זו ההמלצה?',
}) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : []

  if (!safeItems.length) return null

  return (
    <Dropdown>
      <MenuButton
        size="sm"
        variant="plain"
        color={color}
        sx={sx.button}
      >
        {buttonText}
      </MenuButton>

      <Menu
        placement="bottom"
        size="sm"
        variant="outlined"
        sx={sx.menu}
      >
        {safeItems.map((item) => (
          <MenuItem key={item.menuId || item.id || item.label} sx={sx.item}>
            <Box sx={sx.itemContent}>
              <Typography
                level="body-sm"
                sx={item.isPrimary ? sx.labelPrimary : sx.label}
              >
                {item.isPrimary
                  ? `${item.label} · עיקר התובנה`
                  : item.label}
              </Typography>

              <Typography level="body-xs" sx={sx.text}>
                {item.text}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Dropdown>
  )
}
