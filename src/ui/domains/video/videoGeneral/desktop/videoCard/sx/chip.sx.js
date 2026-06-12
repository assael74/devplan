// src/ui/domains/video/videoGeneral/desktop/videoCard/sx/chip.sx.js

import { alpha } from '@mui/system'

export const chipSx = {
  tooltipContent: {
    display: 'grid',
    gap: 0.75,
    maxWidth: 260,
    p: 0.25,
  },

  tooltipTitle: {
    fontWeight: 700,
    color: 'common.white',
  },

  tooltipChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },

  tooltipChip: {
    '--Chip-minHeight': '20px',
    fontSize: 10,
    fontWeight: 700,
  },

  categoriesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    minHeight: 20,
    overflow: 'hidden',
  },

  tagsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    minHeight: 20,
    overflow: 'hidden',
  },

  tagTypeChip: ({ color }) => {
    const chipColor = color || '#64748B'

    return {
      '--Chip-minHeight': '18px',
      '--Chip-paddingInline': '5px',
      maxWidth: 86,
      fontSize: 9,
      fontWeight: 700,
      color: chipColor,
      bgcolor: alpha(chipColor, 0.08),
      border: '1px solid',
      borderColor: alpha(chipColor, 0.16),

      '& .MuiChip-label': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    }
  },

  emptyTagChip: {
    '--Chip-minHeight': '18px',
    '--Chip-paddingInline': '5px',
    fontSize: 9,
    fontWeight: 700,
  },

  moreChip: {
    '--Chip-minHeight': '18px',
    '--Chip-paddingInline': '5px',
    fontSize: 9,
    fontWeight: 700,
    flexShrink: 0,
  },

  tagChip: {
    '--Chip-minHeight': '18px',
    '--Chip-paddingInline': '5px',
    maxWidth: 58,
    fontSize: 9,
    fontWeight: 700,

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}
