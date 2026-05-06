// teamProfile/sharedUi/insights/teamGames/sections/sx/squad.sx.js

import { neutralCard } from './shared.sx.js'

const current = neutralCard()
const INSIGHT_CARD_HEIGHT = 136

export const squadSx = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 1,
  },

  mainCard: {
    ...current,
    gap: 1.1,
  },

  top: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  title: {
    fontWeight: 700,
    opacity: 0.8,
  },

  usageRow: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: '1fr 1fr',
    },
    gap: 1,
    alignItems: 'start',
  },

  sectionsStack: {
    display: 'grid',
    gap: 1,
  },

  sectionCard: {
    borderRadius: 14,
    p: 1,
    display: 'grid',
    gap: 0.85,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontWeight: 700,
    lineHeight: 1.25,
  },

  sectionSubtitle: {
    color: 'text.secondary',
    lineHeight: 1.3,
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      sm: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  metricMini: (color = 'neutral', padding = 1) => ({
    borderRadius: 12,
    p: padding,
    bgcolor: `${color}.softBg`,
    border: '1px solid',
    borderColor: `${color}.outlinedBorder`,
    minHeight: 76,
    display: 'grid',
    alignContent: 'space-between',
    gap: 0.25,
    cursor: 'help',
    overflow: 'hidden',
  }),

  miniTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    minWidth: 0,
  },

  miniTitle: {
    fontWeight: 700,
    opacity: 0.78,
    lineHeight: 1.25,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  miniValue: {
    fontWeight: 700,
    fontSize: {
      xs: 20,
      sm: 23,
    },
    lineHeight: 1,
  },

  subText: {
    color: 'text.secondary',
    lineHeight: 1.35,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },

  emptyState: {
    borderRadius: 12,
    p: 1,
    bgcolor: 'background.level1',
    border: '1px dashed',
    borderColor: 'divider',
    display: 'grid',
    gap: 0.25,
  },

  emptyTitle: {
    fontWeight: 700,
    lineHeight: 1.35,
  },

  insightsRow: (count = 1) => ({
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: count > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
    },
    gap: 0.75,
    pt: 0.1,
  }),

  insightCard: (color = 'neutral') => ({
    minHeight: INSIGHT_CARD_HEIGHT,
    height: INSIGHT_CARD_HEIGHT,
    borderRadius: 12,
    p: 1,
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    gap: 0.65,
    border: '1px solid',
    borderColor: `${color}.outlinedBorder`,
    bgcolor: `${color}.softBg`,
    overflow: 'visible',
    position: 'relative',
    zIndex: 5,
  }),

  insightTop: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  insightTitle: {
    fontWeight: 700,
    opacity: 0.82,
    lineHeight: 1.3,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  insightBody: {
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    gap: 0.2,
  },

  insightValue: {
    fontWeight: 700,
    fontSize: {
      xs: 20,
      sm: 22,
    },
    lineHeight: 1.05,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  insightText: {
    color: 'text.secondary',
    lineHeight: 1.35,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
  },

  detailsButton: {
    justifySelf: 'start',
    minHeight: 0,
    px: 0,
    py: 0,
    fontSize: 12,
    fontWeight: 700,
    alignSelf: 'end',
    '&:hover': {
      bgcolor: 'transparent',
      textDecoration: 'underline',
    },
  },

  detailsMenu: {
    width: 390,
    maxWidth: 'calc(100vw - 32px)',
    p: 0.75,
    borderRadius: 'md',
    boxShadow: 'lg',
    zIndex: 2000,
  },

  detailsMenuItem: {
    alignItems: 'stretch',
    whiteSpace: 'normal',
    borderRadius: 'sm',
    p: 0.75,
    '&:hover': {
      bgcolor: 'neutral.softBg',
    },
  },

  detailItem: {
    display: 'grid',
    gap: 0.25,
    minWidth: 0,
  },

  detailLabel: {
    fontWeight: 700,
    lineHeight: 1.25,
  },

  detailLabelPrimary: {
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.primary',
  },

  detailText: {
    color: 'text.secondary',
    lineHeight: 1.45,
  },

  tooltipBox: {
    minWidth: 220,
    maxWidth: 320,
    display: 'grid',
    gap: 0.55,
  },

  tooltipTitle: {
    fontWeight: 700,
    lineHeight: 1.3,
  },

  tooltipBenchmarkChip: {
    mt: 0.25,
    justifySelf: 'start',
    maxWidth: '100%',
    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'normal',
      lineHeight: 1.3,
    },
  },
}
