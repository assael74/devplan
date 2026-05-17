// teamProfile/sharedUi/management/sx/tabs.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const tabsSx = {
  tabsShell: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile
      ? 'repeat(3, minmax(0, 1fr))'
      : {
          xs: '1fr',
          md: 'repeat(3, minmax(0, 1fr))',
        },
    gap: isMobile ? 0.5 : 0.75,
    mb: 1,
    borderRadius: 'lg',
    bgcolor: 'background.level1',
    boxShadow: 'sm',
    overflowX: 'auto',
    minWidth: 0,
  }),

  tabBtn: (selected, isMobile) => ({
    justifyContent: 'flex-start',
    gap: isMobile ? 0.5 : 1,
    minHeight: { xs: 27, sm: 54 },
    px: isMobile ? 0.5 : 1.25,
    py: isMobile ? 0.5 : undefined,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: selected ? `${c.accent}66` : 'divider',
    bgcolor: selected ? c.bg : 'background.surface',
    color: selected ? c.text : 'text.secondary',
    boxShadow: selected ? 'sm' : 'none',
    transition: 'background .15s ease, transform .12s ease, box-shadow .15s ease',
    minWidth: 0,

    '&:hover': {
      bgcolor: selected ? c.bg : 'background.level2',
      transform: isMobile ? 'none' : 'translateY(-1px)',
      boxShadow: 'sm',
    },
  }),

  tabIcon: (selected, isMobile) => ({
    width: isMobile ? 24 : 34,
    height: isMobile ? 20 : 34,
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

  tabText: (isMobile) => ({
    display: 'grid',
    gap: 0.1,
    minWidth: 0,
    textAlign: 'left',
  }),

  tabLabel: (selected, isMobile) => ({
    fontWeight: 700,
    color: selected ? c.text : 'text.primary',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    fontSize: isMobile ? '0.68rem' : undefined,
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
