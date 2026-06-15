// ui/domains/video/videoAnalysis/mobile/videoCard/VideoAnalysisMobileCard.js

import React from 'react'
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
  VideoMobileMedia,
  VideoMobileInfo,
  VideoMobileTags,
} from '../sharedUi/VideoMobileSharedUi.js'

import { sharedSx as sx } from '../sharedUi/shared.ui.sx'

export default function VideoAnalysisMobileCard({
  video,
  onWatch,
  onEdit,
  onLink,
}) {
  return (
    <Card
      variant="outlined"
      orientation="horizontal"
      sx={sx.cardRoot}
    >
      <CardOverflow>
        <VideoMobileMedia video={video} onWatch={onWatch} />
      </CardOverflow>

      <CardContent sx={sx.content}>
        <VideoMobileInfo video={video} />

        <VideoMobileTags video={video} />
      </CardContent>

      <CardOverflow variant="soft" color="primary" sx={sx.overflow}>
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
            <MenuItem onClick={() => onLink?.(video)}>
              <ListItemDecorator>
                {iconUi({ id: 'link', size: 'sm' })}
              </ListItemDecorator>
              {'\u05e9\u05d9\u05d5\u05da \u05d5\u05d9\u05d3\u05d0\u05d5'}
            </MenuItem>

            <Divider />

            <MenuItem onClick={() => onEdit?.(video)}>
              <ListItemDecorator>
                {iconUi({ id: 'tags', size: 'sm' })}
              </ListItemDecorator>
              {'\u05ea\u05d2\u05d9\u05d5\u05ea \u05d5\u05d4\u05e2\u05e8\u05d5\u05ea'}
            </MenuItem>
          </Menu>
        </Dropdown>
      </CardOverflow>
    </Card>
  )
}
