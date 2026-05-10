
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const tabsSx = {
  tabsShell: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
    gap: 0.75,
    p: 1,
    mb: 1,
    borderRadius: 'lg',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'sm',
  },

  tabBtn: (selected) => ({
    justifyContent: 'flex-start',
    gap: 1,
    minHeight: 54,
    px: 1.25,
    py: 1,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: selected ? `${c.accent}66` : 'transparent',
    bgcolor: selected ? c.bg : 'background.surface',
    color: selected ? c.text : 'text.secondary',
    boxShadow: selected ? 'sm' : 'none',
    transition: 'background .15s ease, transform .12s ease, box-shadow .15s ease',

    '&:hover': {
      bgcolor: selected ? c.bg : 'background.level2',
      transform: 'translateY(-1px)',
      boxShadow: 'sm',
    },
  }),

  tabIcon: (selected) => ({
    width: 34,
    height: 34,
    borderRadius: 'md',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    bgcolor: selected ? 'rgba(255,255,255,0.45)' : 'background.level1',
    color: selected ? c.text : 'text.tertiary',
    border: '1px solid',
    borderColor: 'divider',

    '& svg': {
      fill: 'currentColor',
    },
  }),

  tabText: {
    display: 'grid',
    gap: 0.1,
    minWidth: 0,
    textAlign: 'left',
  },

  tabLabel: (selected) => ({
    fontWeight: 700,
    color: selected ? c.text : 'text.primary',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  }),

  tabSub: (selected) => ({
    color: selected ? c.text : 'text.tertiary',
    opacity: selected ? 0.82 : 1,
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
}
