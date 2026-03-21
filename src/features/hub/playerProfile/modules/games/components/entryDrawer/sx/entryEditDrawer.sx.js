// teamProfile/modules/games/components/entryDrawer/sx/entryEditDrawer.sx.js

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const entryEditDrawerSx = {
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

  drawerRootSx: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: '100%',
    position: 'relative',
  },

  dialogTitle: {
    bgcolor: c.bg,
    borderRadius: 'sm',
    p: 1,
    boxShadow: 'sm',
  },

  titleWrap: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    width: '100%',
  },

  titleMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    flex: 1,
  },

  formNameSx: {
    px: 0.25,
    fontWeight: 700,
    textAlign: 'left',
    lineHeight: 1.2,
  },

  content: {
    display: 'grid',
    gap: 1,
    p: 1.25,
    pt: 1,
    overflowY: 'auto',
    minHeight: 0,
    alignContent: 'start',
    flex: 1,
  },

  fieldsBlock: {
    display: 'grid',
    gap: 1.25,
    p: 1.25,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },

  booleanGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
    gap: 1,
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
    gap: 1,
    pt: 2,
  },

  footerSx: {
    pt: 1,
    mt: 0.5,
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
    flexWrap: 'wrap',
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
