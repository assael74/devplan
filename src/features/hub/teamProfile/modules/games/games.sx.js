// teamProfile/modules/games/games.sx.js
export const teamGamesModuleSx = {
  root: { display: 'grid', gap: 1 },

  kpiSheet: { p: 1, borderRadius: 'md' },
  kpiRow: {
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  kpiLeft: { display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' },

  gamesGrid: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1.25fr 0.75fr' },
    alignItems: 'start',
  },

  panel: {
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.surface',
    borderColor: 'divider',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    mb: 0.75,
  },
}
