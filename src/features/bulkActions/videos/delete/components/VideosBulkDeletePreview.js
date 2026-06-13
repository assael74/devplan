// src/features/bulkActions/videos/delete/components/VideosBulkDeletePreview.js

import React from 'react'
import {
  Box,
  Table,
  Typography,
} from '@mui/joy'
import { alpha } from '@mui/system'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import {
  getVideoPrimaryCategory,
} from '../../../../../shared/video/videoCategories.constants.js'

import {
  getVideoAssignmentText,
  getVideoCardTitle,
} from '../../../../../ui/domains/video/videoGeneral/sharedLogic/videoCard.model.js'

import VideosBulkDeleteStatusChip from './VideosBulkDeleteStatusChip.js'

import {
  videosDeleteModalSx as sx,
} from '../sx/videosDeleteModal.sx.js'

const toneColor = tone => {
  if (tone === 'green') return '#16A34A'
  if (tone === 'orange') return '#F97316'
  if (tone === 'blue') return '#2563EB'
  if (tone === 'purple') return '#7C3AED'
  if (tone === 'yellow') return '#D97706'
  if (tone === 'cyan') return '#0891B2'
  if (tone === 'teal') return '#0F766E'

  return '#64748B'
}

const resolvePrimaryCategoryId = video => {
  if (typeof video?.primaryCategory === 'string') {
    return video.primaryCategory
  }

  return (
    video?.primaryCategoryId ||
    video?.primaryCategory?.id ||
    ''
  )
}

const resolvePrimaryCategory = video => {
  const categoryId = resolvePrimaryCategoryId(video)
  const categoryFromConstants = getVideoPrimaryCategory(categoryId)

  if (categoryFromConstants) {
    return categoryFromConstants
  }

  if (
    video?.primaryCategory &&
    typeof video.primaryCategory === 'object'
  ) {
    return {
      id: video.primaryCategory.id || categoryId,
      label:
        video.primaryCategory.label ||
        video.primaryCategory.name ||
        'ללא קטגוריה',
      iconId:
        video.primaryCategory.iconId ||
        video.primaryCategory.idIcon ||
        'tag',
      tone: video.primaryCategory.tone || 'neutral',
    }
  }

  return null
}

const getAssignmentLabel = video => {
  return getVideoAssignmentText(
    video,
    'ללא שיוך'
  )
}

function VideoCategoryCell({ video }) {
  const category = resolvePrimaryCategory(video)

  if (!category) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.65,
          minHeight: 28,
          px: 1,
          borderRadius: '999px',
          color: 'text.tertiary',
          bgcolor: 'background.level1',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {iconUi({
          id: 'tag',
          sx: {
            fontSize: 17,
            color: '#64748B',
          },
        })}

        <Typography
          level="body-xs"
          sx={{
            color: 'inherit',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          ללא קטגוריה
        </Typography>
      </Box>
    )
  }

  const color = toneColor(category.tone)

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.65,
        minHeight: 28,
        maxWidth: '100%',
        px: 1,
        borderRadius: '999px',
        color,
        bgcolor: alpha(color, 0.1),
        border: '1px solid',
        borderColor: alpha(color, 0.3),
      }}
    >
      {iconUi({
        id: category.iconId || 'tag',
        sx: {
          fontSize: 17,
          color,
          flexShrink: 0,
        },
      })}

      <Typography
        level="body-xs"
        sx={{
          color: 'inherit',
          fontWeight: 700,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {category.label || 'ללא קטגוריה'}
      </Typography>
    </Box>
  )
}

export default function VideosBulkDeletePreview({
  videos = [],
}) {
  if (!videos.length) {
    return (
      <Typography
        level="body-sm"
        color="neutral"
      >
        אין קטעי וידאו להצגה.
      </Typography>
    )
  }

  return (
    <Box
      sx={sx.previewBox}
      className="dpScrollThin"
    >
      <Table
        size="sm"
        stickyHeader
        hoverRow
        sx={{
          '--TableCell-paddingX': '8px',
          '--TableCell-paddingY': '6px',

          '& th': {
            whiteSpace: 'nowrap',
          },

          '& td': {
            verticalAlign: 'middle',
          },
        }}
      >
        <thead>
          <tr>
            <th>שם וידאו</th>
            <th style={{ width: 190 }}>
              קטגוריה
            </th>
            <th style={{ width: 130 }}>
              סטטוס אפיון
            </th>
            <th style={{ width: 140 }}>
              שיוך
            </th>
          </tr>
        </thead>

        <tbody>
          {videos.map(video => {
            const videoId =
              video?.id ||
              video?.videoId ||
              video?.docId ||
              video?.link

            return (
              <tr key={videoId}>
                <td>
                  <Typography
                    level="body-sm"
                    sx={sx.videoName}
                  >
                    {getVideoCardTitle(
                      video,
                      'קטע וידאו'
                    )}
                  </Typography>
                </td>

                <td>
                  <VideoCategoryCell video={video} />
                </td>

                <td>
                  <VideosBulkDeleteStatusChip
                    video={video}
                  />
                </td>

                <td>
                  <Typography
                    level="body-xs"
                    sx={{
                      maxWidth: 140,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'text.secondary',
                    }}
                  >
                    {getAssignmentLabel(video)}
                  </Typography>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </Box>
  )
}
