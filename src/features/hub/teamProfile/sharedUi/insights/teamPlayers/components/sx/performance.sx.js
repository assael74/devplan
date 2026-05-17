// teamProfile/sharedUi/insights/teamPlayers/components/sx/performance.sx.js

export const performanceSx = {
  annualRoot: {
    display: 'grid',
    gap: 1,
  },

  scopeBar: {
    p: 1,
    borderRadius: 'xl',
    display: 'grid',
    gap: 1,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },

  scopeHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  scopeTitleWrap: {
    display: 'grid',
    gap: 0.25,
    minWidth: 0,
  },

  scopeTitle: {
    fontWeight: 700,
  },

  scopeSub: {
    color: 'text.tertiary',
    lineHeight: 1.4,
  },

  scopeCountChip: {
    flexShrink: 0,
    border: '1px solid',
    borderColor: 'divider',
  },

  scopeControls: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: '180px minmax(0, 1fr) minmax(0, 1fr)',
    },
    gap: 0.75,
    alignItems: 'center',
  },

  scopeSelect: {
    minWidth: 0,
  },

  gameSelect: {
    minWidth: 0,
  },

  scopeWarning: {
    color: 'warning.softColor',
    fontWeight: 600,
  },

  tvaText: {
    color: 'text.tertiary',
    lineHeight: 1.45,
  },

  emptyAnnual: {
    p: 1.5,
    borderRadius: 'xl',
  },

  profileSection: {
    p: 1,
    borderRadius: 'xl',
    display: 'grid',
    gap: 1,
  },

  profileHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  profileHeaderText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.45,
  },

  profileChip: {
    width: 'fit-content',
    flexShrink: 0,
    border: '1px solid',
    borderColor: 'divider',
  },

  profileDescription: {
    color: 'text.tertiary',
    lineHeight: 1.4,
  },

  playersList: {
    display: 'grid',
    gap: 1,
  },

  playerCard: {
    p: 1.25,
    borderRadius: 'xl',
    display: 'grid',
    gap: 0.75,
  },

  playerTopRow: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'minmax(220px, 1.15fr) minmax(0, 2fr)',
    },
    gap: 0.75,
    alignItems: 'stretch',
    minWidth: 0,
  },

  playerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    p: 0.75,
    borderRadius: 'lg',
    bgcolor: 'background.level1',
  },

  avatar: {
    width: 42,
    height: 42,
    flexShrink: 0,
  },

  playerText: {
    minWidth: 0,
    flex: 1,
    display: 'grid',
    gap: 0.25,
  },

  playerNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    width: '100%',
  },

  playerName: {
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
    flex: '1 1 auto',
  },

  playerInsightChip: {
    flex: '0 0 auto',
    maxWidth: 130,
    marginInlineStart: 'auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    border: '1px solid',
    borderColor: 'divider',
  },

  playerMeta: {
    color: 'text.tertiary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      sm: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.75,
    minWidth: 0,
  },

  metric: (color = 'neutral') => ({
    p: 0.75,
    border: '1px solid',
    borderRadius: 'lg',
    borderColor: `${color}.outlinedBorder`,
    bgcolor: `${color}.softBg`,
    color: `${color}.softColor`,
    minWidth: 0,
  }),

  metricLabel: {
    color: 'text.tertiary',
  },

  metricValue: {
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  insightMetric: {
    p: 0.75,
    border: '1px solid',
    borderRadius: 'lg',
    borderColor: 'divider',
    bgcolor: 'background.level1',
    minWidth: 0,
    gridColumn: '1 / -1',
  },

  insightMetricHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 0.35,
  },

  insightIcon: {
    color: 'text.tertiary',
    lineHeight: 0,
    flexShrink: 0,
  },

  insightText: {
    fontWeight: 600,
    lineHeight: 1.45,
  },

  subStatus: {
    color: 'text.tertiary',
  },

  emptyProfile: {
    p: 1.25,
    borderRadius: 'xl',
  },

  mutedText: {
    color: 'text.tertiary',
  },
}
