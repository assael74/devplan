// features/calendarHub/components/drawer/sx/drawer.sx.js

import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('calendar')

export const drawerSx = {
  drawerSx: {
    bgcolor: 'transparent',
    p: { md: 2, xs: 0 },
    boxShadow: 'none',
  },

  drawerSheet: {
    borderRadius: 'md',
    py: 1,
    px: 0.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    height: '100%',
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  headerSx: {
    p: 1,
    pb: 0.5,
  },

  headerMainSx: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  headerTitleWrapSx: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1,
    minWidth: 0,
  },

  headerIconSx: {
    height: 36,
    width: 36,
    minWidth: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: c.bg,
    color: c.text,
  },

  headerMetaRowSx: {
    mt: 0.5,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  content: {
    display: 'grid',
    gap: 1.25,
    p: 1.25,
    overflowY: 'auto',
    minHeight: 0,
  },

  footerSx: {
    pt: 1,
    mt: 'auto',
    px: 2,
    borderTop: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    bgcolor: 'background.body',
  },

  footerActionsSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  icoRes: {
    height: 36,
    width: 36,
    flexShrink: 0,
    border: '1px solid',
    borderColor: c.accent,
  },

  conBut: {
    bgcolor: c.bg,
    color: c.text,
    transition: 'filter .15s ease, transform .12s ease',
    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },
}
