// src/features/hub/playerProfile/sharedUi/insights/playerGames/sections/sx/TeamImpact.sx.js

export const teamImpactSx = {
  root: {
    p: 1.1,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    gap: 0.9,
    minWidth: 0,
    alignContent: 'start',
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.primary',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.75,
    minWidth: 0,
  },

  takeawayWrap: {
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
