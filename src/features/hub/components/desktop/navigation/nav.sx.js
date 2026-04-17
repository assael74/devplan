// features/hub/components/desktop/navigation/nav.sx.js

import { getEntityColors } from '../../../../../ui/core/theme/Colors'
import { tabClasses } from '@mui/joy/Tab';

export const navSx = {
  sheet: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    px: 1.5,
    py: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    borderRadius: 'sm',
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
