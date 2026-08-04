import { devPlanColors, getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const tabsSx = {
  tabsShell: {
    display: 'inline-grid',
    gridTemplateColumns: 'repeat(3, minmax(0, auto))',
    gap: 0.15,
    mb: 0.85,
    p: 0.18,
    borderRadius: 'sm',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
    overflowX: 'auto',
    minWidth: 0,
    maxWidth: '100%',
  },

  tabBtn: (selected) => ({
    justifyContent: 'center',
    gap: 0.4,
    minHeight: 30,
    px: 0.85,
    py: 0.32,
    borderRadius: 'sm',
    border: '1px solid',
    borderColor: selected ? devPlanColors.border : 'transparent',
    bgcolor: selected ? 'background.surface' : 'transparent',
    color: selected ? 'text.primary' : 'text.secondary',
    boxShadow: 'none',
    transition: 'background .15s ease, border-color .15s ease, color .15s ease',
    minWidth: 0,

    '&:hover': {
      bgcolor: selected ? 'background.surface' : devPlanColors.secondaryLight,
      borderColor: selected ? devPlanColors.border : 'divider',
    },
  }),

  tabIcon: (selected) => ({
    width: 20,
    height: 20,
    borderRadius: 'sm',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    bgcolor: selected ? c.bg : 'transparent',
    color: selected ? c.accent : 'text.tertiary',

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
    fontWeight: selected ? 600 : 500,
    color: selected ? 'text.primary' : 'text.secondary',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    fontSize: '0.78rem',
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
