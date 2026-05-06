// playerProfile/sharedUi/insights/playerGames/sections/sx/Expectation.sx.js

export const expectationSx = {
  mainGrid: (layout = 'attacking') => ({
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: layout === 'defensive'
        ? '1fr 1.45fr'
        : '1.45fr 1fr',
    },
    gap: 0.85,
    minWidth: 0,
    alignItems: 'stretch',
  }),

  block: {
    p: 1.1,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    alignContent: 'start',
    gap: 0.9,
    minWidth: 0,
  },

  blockHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  blockTitle: {
    color: 'text.primary',
    fontWeight: 700,
    lineHeight: 1.25,
  },

  positionChip: {
    flexShrink: 0,
    fontWeight: 700,
    '--Chip-minHeight': '22px',
    '--Chip-paddingInline': '8px',
    fontSize: 11,
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
