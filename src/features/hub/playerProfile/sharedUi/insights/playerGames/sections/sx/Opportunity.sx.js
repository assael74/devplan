// playerProfile/sharedUi/insights/playerGames/sections/sx/Opportunity.sx.js

export const opportunitySx = {
  root: {
    p: 1.15,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    gap: 1,
    minWidth: 0,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  titleBlock: {
    display: 'grid',
    gap: 0.15,
    minWidth: 0,
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.primary',
  },

  subtitle: {
    color: 'text.secondary',
    fontWeight: 600,
    lineHeight: 1.35,
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr 1fr',
      md: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 0.75,
    minWidth: 0,
  },

  takeawayWrap: {
    pt: 0.15,
    minWidth: 0,
  },

  emptyState: {
    p: 1,
    borderRadius: 'md',
    bgcolor: 'neutral.softBg',
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    gap: 0.25,
    minWidth: 0,
  },

  emptyTitle: {
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.primary',
  },

  emptyText: {
    color: 'text.secondary',
    lineHeight: 1.4,
    fontWeight: 500,
  },
}
