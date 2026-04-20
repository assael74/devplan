// ui/patterns/drawer/sx/drawer.sx.js

import { getEntityColors } from '../../../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

export const drawerSx = {
  root: (isMobile) => ({
    bgcolor: !isMobile ? 'transparent' : '',
    p: { xs: 0, md: 3 },
    boxShadow: 'none',
  }),

  sheet: {
    borderRadius: 'md',
    py: 1,
    px: 0.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    height: '100%',
    overflow: 'auto',
    bgcolor: 'background.body',
  },

  content: {
    display: 'grid',
    gap: 1.25,
    p: 1,
    overflowY: 'auto',
    minHeight: 0
  },

  footer: {
    pt: 1,
    mt: 1,
    px: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    bgcolor: 'background.body',
  },

  footerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  icoRes: {
    height: 36,
    width: 36,
    flexShrink: 0,
    border: '1px solid',
    borderColor: 'divider',
  },

  conBut: (entity) => ({
    bgcolor: c(entity).bg,
    color: c(entity).text,
    transition: 'filter .15s ease, transform .12s ease',
    border: '1px solid',
    borderColor: 'divider',

    '&:hover': {
      bgcolor: c(entity).bg,
      color: c(entity).text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  }),
}
