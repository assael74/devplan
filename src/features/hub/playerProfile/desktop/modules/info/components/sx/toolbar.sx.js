
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const toolbarSx = {
  toolbar: (nonShow) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    px: 1.5,
    py: nonShow ? 1.55 : 0.85,
    borderRadius: 'md',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'sm',
    minWidth: 0,
    flexWrap: 'wrap',
  }),

  toolbarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexShrink: 0,
  },

  headerDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    bgcolor: c.accent,
    boxShadow: '0 0 0 4px rgba(76,110,245,0.12)',
    flexShrink: 0,
  },

  confBtn: {
    bgcolor: c.bg,
    color: c.text,
    fontWeight: 700,
    boxShadow: 'sm',
    px: 1.5,
    transition: 'filter .15s ease, transform .12s ease',
    border: '1px solid',
    borderColor: 'divider',

    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },
}
