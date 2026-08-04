// features/hub/components/desktop/navigation/nav.sx.js

import { getEntityColors } from '../../../../../ui/core/theme/Colors'
import { tabClasses } from '@mui/joy/Tab';

export const navSx = {
  sheet: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    minHeight: 68,
    px: 1.25,
    py: 0.75,
    borderBottom: '1px solid',
    borderColor: 'divider',
    borderRadius: 'sm',
    display: 'flex',
    alignItems: 'center',
  },

  headerTabs: (entityType) => {
    const c = getEntityColors(entityType)

    return {
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
    }
  },
}
