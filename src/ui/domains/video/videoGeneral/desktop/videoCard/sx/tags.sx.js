// src/ui/domains/video/videoGeneral/desktop/videoCard/sx/tags.sx.js

import { alpha } from '@mui/system'
import { getEntityColors } from '../../../../../../core/theme/Colors.js'

const c = getEntityColors('videoGeneral')

export const videoGeneralDesktopTagsSx = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    flexWrap: 'wrap',
    minHeight: 22,
    minWidth: 0,
  },

  chip: {
    '--Chip-minHeight': '16px',
    '--Chip-paddingInline': '5px',
    height: 16,
    fontSize: 9,
    fontWeight: 700,
    maxWidth: 110,
    bgcolor: alpha(c.accent, 0.06),
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      px: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
    },

    '& .MuiChip-startDecorator svg': {
      width: 10,
      height: 10,
      fontSize: 10,
    },
  },

  emptyChip: {
    '--Chip-minHeight': '16px',
    '--Chip-paddingInline': '5px',
    height: 16,
    fontSize: 9,
    opacity: 0.65,

    '& .MuiChip-startDecorator svg': {
      width: 10,
      height: 10,
      fontSize: 10,
    },
  },

  moreChip: {
    '--Chip-minHeight': '18px',
    height: 18,
    fontSize: 10,
    fontWeight: 800,
  },
}
