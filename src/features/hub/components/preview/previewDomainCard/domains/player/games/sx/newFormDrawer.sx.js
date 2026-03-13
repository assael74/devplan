// previewDomainCard/domains/player/games/sx/newFormDrawer.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const drawerNewFormSx = {
  drawerSheetSx: {
    borderRadius: { xs: 0, md: 'lg' },
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    height: '100%',
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  drawerRootSx: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  drawerContent: {
    bgcolor: 'transparent',
    p: { xs: 0, md: 2 },
    boxShadow: 'none',
  },

  modalClose: {
    mt: 2,
    mr: 2,
  },

  body: {
    display: 'grid',
    gap: 1,
    p: 1.25,
    pt: 1,
    overflowY: 'auto',
    minHeight: 0,
  },

  fieldsRoot: {
    display: 'grid',
    gap: 1,
  },

  statusText: {
    px: 0.25,
    textAlign: 'center',
    fontWeight: 600,
    pt: 5
  },

  fieldsBlock: (isGameChosen = false) => ({
    display: 'grid',
    gap: 1,
    opacity: isGameChosen ? 1 : 0.56,
    transition: 'opacity .18s ease',
  }),

  booleanGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
    gap: 1,
    alignItems: 'start',
    pt: 3
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
    gap: 1,
    alignItems: 'start',
  },

  footerSx: {
    pt: 1,
    mt: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    bgcolor: 'background.body',
    marginTop: 'auto',
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
