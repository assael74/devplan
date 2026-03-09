// clubProfile/modules/teams/teams.sx.js
export const clubTeamsModuleSx = {
  root: { display: 'grid', gap: 1, pt: 1 },

  kpiRow: {
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  kpiLeft: { display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' },

  tableWrap: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 12,
    overflow: 'auto',
    bgcolor: 'background.surface',
  },

  table: {
    minWidth: 860,
    '& thead th': { whiteSpace: 'nowrap' },
    '& tbody td': { verticalAlign: 'middle' },
  },
}
