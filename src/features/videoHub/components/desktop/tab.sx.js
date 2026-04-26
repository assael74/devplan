// videoHub/components/desktop/tab.sx.js

import { getEntityColors } from '../../../../ui/core/theme/Colors'
import { tabClasses } from '@mui/joy/Tab';

const c = getEntityColors('videoGeneral')

export const videoTabSx = {
  headerSheet: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    borderBottom: '1px solid',
    borderColor: 'divider',
    borderRadius: 'sm',
    px: 2,
    py: 0.75,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
  },

  headerTabs: {
    p: 0.5,
    gap: 0.5,
    borderRadius: 'sm',
    bgcolor: 'background.level1',
    [`& .${tabClasses.root}`]: {
      py: 0.5,
      borderRadius: 'sm',
      minHeight: 32,
      color: 'text.secondary',
      transition: 'background-color 140ms ease, box-shadow 160ms ease, transform 140ms ease',
      '&:hover': {
        bgcolor: 'neutral.softHoverBg',
        color: 'text.primary',
        transform: 'translateY(-1px)',
      },
    },
    [`& .${tabClasses.root}[aria-selected="true"]`]: {
      boxShadow: 'sm',
      bgcolor: c.bg,
      color: 'rgba(0,0,0,0.85)',
      '&:hover': {
        bgcolor: c.hover || c.bg,
      },
    },
  },

  gridWrap: {
    display: 'grid',
    gap: 1.25,
    width: '100%',
    mx: 0,
    px: 2,
    alignContent: 'start',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 280px))',
  },
}
