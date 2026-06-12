// src/ui/domains/video/videoGeneral/desktop/videoCard/VideoDesktopCardChips.js

import React from 'react'
import { Box, Chip, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../core/icons/iconUi.js'
import {
  getVideoCardTagLabel,
  VIDEO_CARD_TAG_TYPE_COLORS,
} from '../../sharedLogic/index.js'

import { chipSx as sx } from './sx/chip.sx.js'

function ChipTooltipContent({
  title,
  items,
  getLabel = item => item,
}) {
  return (
    <Box sx={sx.tooltipContent}>
      <Typography level="body-xs" sx={sx.tooltipTitle}>
        {title}
      </Typography>

      <Box sx={sx.tooltipChips}>
        {items.map((item, index) => (
          <Chip
            key={`${getLabel(item)}-${index}`}
            size="sm"
            variant="soft"
            sx={sx.tooltipChip}
          >
            {getLabel(item)}
          </Chip>
        ))}
      </Box>
    </Box>
  )
}

export function VideoDesktopTagTypesRow({ model }) {
  const tooltip = (
    <ChipTooltipContent
      title="סוגים"
      items={model.tagTypes}
      getLabel={tagType => tagType.label}
    />
  )

  return (
    <Box sx={sx.categoriesRow}>
      {model.visibleTagTypes.length ? (
        model.visibleTagTypes.map(tagType => (
          <Tooltip key={tagType.id} title={tooltip} arrow>
            <Chip
              size="sm"
              variant="soft"
              sx={sx.tagTypeChip({
                color: VIDEO_CARD_TAG_TYPE_COLORS[tagType.id],
              })}
              startDecorator={iconUi({ id: tagType.iconId, size: 'xs' })}
            >
              {tagType.label}
            </Chip>
          </Tooltip>
        ))
      ) : (
        <Chip size="sm" variant="outlined" color="neutral" sx={sx.emptyTagChip}>
          אין סוגים
        </Chip>
      )}

      {model.hiddenTagTypesCount > 0 ? (
        <Tooltip title={tooltip} arrow>
          <Chip size="sm" variant="soft" sx={sx.moreChip}>
            +{model.hiddenTagTypesCount}
          </Chip>
        </Tooltip>
      ) : null}
    </Box>
  )
}

export function VideoDesktopTagsRow({ model }) {
  const tooltip = (
    <ChipTooltipContent
      title="תגים"
      items={model.tagLabels}
    />
  )

  return (
    <Box sx={sx.tagsRow}>
      {model.visibleTags.length ? (
        model.visibleTags.map((tag, index) => {
          const label = getVideoCardTagLabel(tag)

          return (
            <Tooltip key={`${label}-${index}`} title={tooltip} arrow>
              <Chip size="sm" variant="outlined" sx={sx.tagChip}>
                {label}
              </Chip>
            </Tooltip>
          )
        })
      ) : (
        <Chip size="sm" variant="outlined" color="neutral" sx={sx.emptyTagChip}>
          אין תגים
        </Chip>
      )}

      {model.hiddenTagsCount > 0 ? (
        <Tooltip title={tooltip} arrow>
          <Chip size="sm" variant="soft" sx={sx.moreChip}>
            +{model.hiddenTagsCount}
          </Chip>
        </Tooltip>
      ) : null}
    </Box>
  )
}
