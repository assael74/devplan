// ui/domains/video/videoAGeneral/mobile/VideoMobileSharedUi.js

import React, { useState } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import ImageNotSupportedRounded from '@mui/icons-material/ImageNotSupportedRounded'

import { iconUi } from '../../../../../core/icons/iconUi.js'
import { getVideoCardTagLabel } from '../../sharedLogic/index.js'

import { sharedSx as sx } from './shared.ui.sx.js'

export function VideoMobileMedia({ video, model, actions }) {
  const [imgOk, setImgOk] = useState(true)

  return (
    <Box
      sx={sx.mediaRoot}
      onClick={actions.canWatch ? actions.handleWatch : undefined}
      role={actions.canWatch ? 'button' : undefined}
      tabIndex={actions.canWatch ? 0 : undefined}
      onKeyDown={
        actions.canWatch
          ? event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                actions.handleWatch(video)
              }
            }
          : undefined
      }
    >
      {model.thumb && imgOk ? (
        <>
          <Box
            component="img"
            src={model.thumb}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgOk(false)}
            sx={sx.mediaImg}
          />
          <Box sx={sx.mediaOverlay} />
        </>
      ) : (
        <Box sx={sx.mediaFallback}>
          <ImageNotSupportedRounded />
        </Box>
      )}

      {model.preview ? (
        <Box sx={sx.mediaPlay}>
          {iconUi({ id: 'playVideo', sx: { fontSize: 13, color: '#fff' } })}
        </Box>
      ) : null}
    </Box>
  )
}

export function VideoMobileInfo({ model }) {
  return (
    <Box sx={{ pt: 1 }}>
      <Typography
        level="title-sm"
        sx={sx.title}
        startDecorator={iconUi({ id: model.assignmentIcon, size: 'sm' })}
      >
        "{model.title}"
      </Typography>
    </Box>
  )
}

export function VideoMobileTags({ model }) {
  const hasTagTypes = model.visibleTagTypes.length > 0
  const hasTags = model.visibleTags.length > 0

  if (!hasTagTypes && !hasTags) {
    return (
      <Box sx={sx.tagsCell}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary', fontStyle: 'italic' }}>
          ללא תגיות
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.tagsCell}>
      <Box sx={sx.tagsWrap}>
        {model.visibleTagTypes.map(tagType => (
          <Chip
            key={tagType.id}
            size="sm"
            variant="soft"
            startDecorator={iconUi({ id: tagType.iconId, size: 'sm' })}
            sx={sx.tagTypeChip}
          >
            {tagType.label}
          </Chip>
        ))}

        {model.hiddenTagTypesCount > 0 ? (
          <Chip size="sm" variant="plain" color="neutral" sx={{ fontWeight: 700 }}>
            +{model.hiddenTagTypesCount}
          </Chip>
        ) : null}

        {model.visibleTags.map((tag, index) => {
          const label = getVideoCardTagLabel(tag)

          return (
            <Chip
              key={tag?.id || tag?.tagId || `${label}_${index}`}
              size="sm"
              variant="soft"
              startDecorator={iconUi({ id: 'children', size: 'sm' })}
              sx={sx.tagChip}
            >
              {label}
            </Chip>
          )
        })}

        {model.hiddenTagsCount > 0 ? (
          <Chip size="sm" variant="plain" color="neutral" sx={{ fontWeight: 700 }}>
            +{model.hiddenTagsCount}
          </Chip>
        ) : null}
      </Box>
    </Box>
  )
}
