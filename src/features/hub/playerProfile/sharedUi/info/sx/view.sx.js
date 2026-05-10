// features/hub/playerProfile/sharedUi/info/sx/view.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

const toneVars = {
  attack: {
    bg: 'rgba(255, 183, 77, 0.14)',
    border: 'rgba(251, 140, 0, 0.28)',
    iconBg: 'rgba(255, 183, 77, 0.22)',
    iconColor: '#EF6C00',
  },

  creation: {
    bg: 'rgba(100, 181, 246, 0.14)',
    border: 'rgba(30, 136, 229, 0.26)',
    iconBg: 'rgba(100, 181, 246, 0.22)',
    iconColor: '#1976D2',
  },

  impact: {
    bg: 'rgba(149, 117, 205, 0.14)',
    border: 'rgba(103, 58, 183, 0.25)',
    iconBg: 'rgba(149, 117, 205, 0.22)',
    iconColor: '#5E35B1',
  },

  usage: {
    bg: 'rgba(144, 164, 174, 0.13)',
    border: 'rgba(96, 125, 139, 0.24)',
    iconBg: 'rgba(144, 164, 174, 0.2)',
    iconColor: '#546E7A',
  },

  lineup: {
    bg: 'rgba(77, 182, 172, 0.13)',
    border: 'rgba(0, 150, 136, 0.24)',
    iconBg: 'rgba(77, 182, 172, 0.2)',
    iconColor: '#00897B',
  },

  defense: {
    bg: 'rgba(129, 199, 132, 0.13)',
    border: 'rgba(67, 160, 71, 0.25)',
    iconBg: 'rgba(129, 199, 132, 0.2)',
    iconColor: '#2E7D32',
  },

  teamDefense: {
    bg: 'rgba(121, 134, 203, 0.13)',
    border: 'rgba(63, 81, 181, 0.24)',
    iconBg: 'rgba(121, 134, 203, 0.2)',
    iconColor: '#3949AB',
  },

  neutral: {
    bg: 'background.surface',
    border: 'divider',
    iconBg: 'background.level1',
    iconColor: 'text.secondary',
  },
}

const getTone = (tone = 'neutral') => {
  return toneVars[tone] || toneVars.neutral
}

export const viewSx = {
  root: {
    display: 'grid',
    gap: 1,
    minWidth: 0,
  },

  basisArea: {
    minWidth: 0,
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
  },

  basisItem: {
    position: 'relative',
    overflow: 'hidden',
    px: 1,
    py: 0.85,
    pr: 4.25,
    minHeight: 58,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
    minWidth: 0,
    display: 'grid',
    alignContent: 'start',
    gap: 0.35,
    boxShadow: 'xs',
    transition: '160ms ease',

    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 'sm',
      bgcolor: c.bg,
    },
  },

  basisIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.surface',
    color: 'text.secondary',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'xs',

    '& svg': {
      fill: 'currentColor',
    },
  },

  itemLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    mb: 0.25,
  },

  basisValue: {
    fontWeight: 700,
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  title: {
    fontWeight: 700,
    color: 'text.primary',
    pb: 0.5,
    mb: 0.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  basisGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.75,
    mt: 1,
    minWidth: 0,
  },

  section: {
    p: 1,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    minWidth: 0,
  },

  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 0.85,
    p: 0.5,
    minWidth: 0,
  },

  metric: (tone = 'neutral') => {
    const c = getTone(tone)

    return {
      position: 'relative',
      overflow: 'hidden',
      px: 1,
      py: 0.85,
      minHeight: 92,
      borderRadius: 'md',
      border: '1px solid',
      borderColor: c.border,
      bgcolor: c.bg,
      minWidth: 0,
      display: 'grid',
      alignContent: 'start',
      gap: 0.35,
      boxShadow: 'xs',
      transition: '160ms ease',

      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: 'sm',
      },
    }
  },

  metricTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    minWidth: 0,
  },

  metricIcon: (tone = 'neutral') => {
    const c = getTone(tone)

    return {
      width: 28,
      height: 28,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      flex: '0 0 auto',
      bgcolor: c.iconBg,
      color: c.iconColor,
      border: '1px solid',
      borderColor: c.border,

      '& svg': {
        fill: 'currentColor',
      },
    }
  },

  metricValue: {
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
  },

  metricHelper: {
    color: 'text.tertiary',
    mt: 0.1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  empty: {
    p: 1.25,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    display: 'grid',
    gap: 0.25,
  },

  emptyTitle: {
    fontWeight: 700,
  },

  emptySub: {
    color: 'text.tertiary',
  },
}
