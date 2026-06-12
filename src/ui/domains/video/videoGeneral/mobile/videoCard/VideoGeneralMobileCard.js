// ui/domains/video/videoGeneral/mobile/videoCard/VideoGeneralMobileCard.js

import React, { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardOverflow,
  Divider,
  Dropdown,
  IconButton,
  ListItemDecorator,
  Menu,
  MenuButton,
  MenuItem,
} from '@mui/joy'

import { iconUi } from '../../../../../core/icons/iconUi.js'
import {
  buildVideoCardActions,
  buildVideoCardModel,
} from '../../sharedLogic/index.js'

import {
  VideoMobileMedia,
  VideoMobileInfo,
  VideoMobileTags,
} from './VideoMobileSharedUi.js'

import { sharedSx as sx } from './shared.ui.sx.js'

export default function VideoGeneralMobileCard({
  video,
  onWatch,
  onEdit,
  onShare,
  onDelete,
  tagsById,
  canEdit = true,
  canDelete = true,
  canShare = true,
}) {
  const model = useMemo(
    () =>
      buildVideoCardModel({
        video,
        tagsById,
        tagLimit: 2,
        tagTypeLimit: 2,
      }),
    [video, tagsById]
  )

  const actions = useMemo(
    () =>
      buildVideoCardActions({
        video,
        model,
        onWatch,
        onEdit,
        onShare,
        onDelete,
        canEdit,
        canDelete,
        canShare,
      }),
    [video, model, onWatch, onEdit, onShare, onDelete, canEdit, canDelete, canShare]
  )

  return (
    <Card
      variant="outlined"
      orientation="horizontal"
      sx={{
        width: '100%',
        p: 0,
        gap: 0.5,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <CardOverflow>
        <VideoMobileMedia
          video={video}
          model={model}
          actions={actions}
        />
      </CardOverflow>

      <CardContent sx={sx.content}>
        <VideoMobileInfo model={model} />

        <Divider />

        <VideoMobileTags model={model} />
      </CardContent>

      <CardOverflow variant="soft" color="neutral" sx={sx.overflow}>
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
      </CardOverflow>
    </Card>
  )
}
