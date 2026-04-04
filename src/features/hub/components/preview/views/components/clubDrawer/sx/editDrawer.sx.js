// features/hub/components/preview/views/components/drawer/sx/editDrawer.sx.js

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('clubs')

export const editDrawerSx = {
  drawerSx: {
    bgcolor: 'transparent',
    p: { xs: 0, md: 2 },
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

  drawerRootSx: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: '100%',
  },

  headerRowSx: {
    px: 1.25,
    pt: 0.75,
    pb: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    borderRadius: 'sm',
    bgcolor: c.bg,
  },

  headerMainSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    width: '100%',
    pr: 4,
  },

  heroTextSx: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  },

  content: {
    display: 'grid',
    gap: 1.25,
    p: 1.25,
    overflowY: 'auto',
    minHeight: 0,
    flex: 1,
  },

  sectionCardSx: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'md',
    p: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    bgcolor: 'background.level1',
  },

  gridInfoSx: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr' },
    gap: 1,
    alignItems: 'start',
  },

  inlineChecksSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
    mt: 0.25,
  },

  footerSx: {
    pt: 1,
    mt: 1,
    px: 2,
    pb: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    bgcolor: 'background.body',
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
