// playerProfile/desktop/modules/videos/sx/playerVideosRow.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

export const rowSx = {
  rowCardSx: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: '100px 1px minmax(120px,1fr) 1px .5fr 1px minmax(160px,1.1fr) 1px minmax(100px,1fr) 1px 40px',
    },
    gap: 1,
    alignItems: 'stretch',
    px: 1,
    py: 0.95,
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level2',
    mb: 0.75,
    transition: 'transform .14s ease, box-shadow .14s ease, border-color .14s ease',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: 3,
      height: '100%',
      opacity: 0.95,
    },

    '&:hover': {
      bgcolor: `${c.bg}66`,
      boxShadow: 'sm',
    },
  },

  dividerSx: {
    display: { xs: 'none', lg: 'block' },
    mx: 0.75,
    my: 0.5,
    bgcolor: `${c.accent}22`,
  },

  actionsCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.5,
    px: 0.5,
  },
}
