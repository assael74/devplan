import { devPlanColors, getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const tabsSx = {
  tabsShell: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, auto))',
    justifyContent: 'start',
    gap: 0.35,
    p: 0.3,
    borderRadius: 'sm',
    bgcolor: devPlanColors.primaryLight,
    boxShadow: 'inset 0 0 0 1px rgba(23, 59, 87, 0.08)',
    overflowX: 'auto',
    minWidth: 0,
    maxWidth: '100%',
  },

  tabBtn: (selected) => ({
    justifyContent: 'center',
    gap: 0.5,
    minHeight: 34,
    px: 1.1,
    py: 0.4,
    borderRadius: 'sm',
    border: 0,
    bgcolor: selected ? devPlanColors.surface : 'transparent',
    color: selected ? devPlanColors.primary : devPlanColors.secondary,
    boxShadow: selected ? '0 6px 14px rgba(23, 59, 87, 0.12)' : 'none',
    transition: 'background .15s ease, border-color .15s ease, color .15s ease',
    minWidth: 0,

    '&:hover': {
      bgcolor: selected ? devPlanColors.surface : devPlanColors.secondaryLight,
    },
  }),

  tabIcon: (selected) => ({
    width: 20,
    height: 20,
    borderRadius: 'sm',
    display: 'inline-grid',
    placeItems: 'center',
    lineHeight: 0,
    flexShrink: 0,
    bgcolor: selected ? c.bg : devPlanColors.surface,
    color: selected ? c.accent : devPlanColors.secondary,
    boxShadow: selected ? `0 0 0 1px ${c.accent}22` : '0 0 0 1px rgba(101,118,132,0.12)',

    '& svg': {
      width: 14,
      height: 14,
      display: 'block',
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
    fontWeight: selected ? 700 : 600,
    color: selected ? devPlanColors.primary : devPlanColors.secondary,
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
