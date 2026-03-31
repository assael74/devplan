import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const editDrawerSx = {
  drawerSx: {
    bgcolor: 'transparent',
    p: { md: 3, sm: 0 },
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
    overflow: 'auto',
    bgcolor: 'background.body',
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
    mt: 1,
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

  icoRes: {
    height: 36,
    width: 36,
    flexShrink: 0,
    border: '1px solid',
    borderColor: c.accent,
  },

  evalSheet: {
    p: 1,
    borderRadius: 'md',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  evalSelect: {
    p: 1,
    borderRadius: 'md',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    bgcolor: 'background.level1',
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
