// src/ui/domains/video/videoGeneral/desktop/videoCard/VideoDesktopActionsMenu.js

import React from 'react'
import {
  Divider,
  Dropdown,
  IconButton,
  ListItemDecorator,
  Menu,
  MenuButton,
  MenuItem,
} from '@mui/joy'

import { iconUi } from '../../../../../core/icons/iconUi.js'

import { cardSx as sx } from './sx/card.sx.js'

export default function VideoDesktopActionsMenu({ actions }) {
  if (!actions.menuItems.length) return null

  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{
          root: {
            size: 'sm',
            variant: 'plain',
            sx: sx.moreButton,
          },
        }}
      >
        {iconUi({ id: 'more' })}
      </MenuButton>

      <Menu size="sm" placement="bottom-end">
        {actions.menuItems.map(item =>
          item.divider ? (
            <Divider key="divider" />
          ) : (
            <MenuItem
              key={item.id}
              color={item.color}
              onClick={item.onClick}
            >
              <ListItemDecorator>
                {iconUi({ id: item.icon, size: 'sm' })}
              </ListItemDecorator>
              {item.label}
            </MenuItem>
          )
        )}
      </Menu>
    </Dropdown>
  )
}
