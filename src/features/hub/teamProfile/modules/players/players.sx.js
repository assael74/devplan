// teamProfile/modules/players/players.sx.js
export const teamPlayersModuleSx = {
  root: { display: 'grid', gap: 1, pt: 1 },

  kpiSheet: { p: 1, borderRadius: 'md' },
  kpiRow: {
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  kpiLeft: { display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' },

  filtersRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', sm: '1.3fr 0.7fr 0.7fr auto' },
    alignItems: 'end',
  },

  playersPanel: {
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

  list: { display: 'grid', gap: 0.75 },

  row: {
    display: 'grid',
    gap: 1,
    alignItems: 'center',
    gridTemplateColumns: { xs: '40px 1fr auto', sm: '40px 1.2fr 0.8fr auto' },
    p: 0.75,
    borderRadius: 12,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
  },

  nameCol: { display: 'grid', gap: 0.25 },
  chipsCol: { display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', sm: 'flex-end' } },

  actions: { display: 'flex', gap: 0.5, justifyContent: 'flex-end', flexWrap: 'wrap' },
}
