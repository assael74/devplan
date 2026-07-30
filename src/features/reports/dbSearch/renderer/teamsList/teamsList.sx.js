// src/features/reports/dbSearch/renderer/teamsList/teamsList.sx.js

export const teamsListSx = {
  root: ({ device = 'desktop' } = {}) => ({
    width: '100%',
    minHeight: '100%',
    p: device === 'mobile' ? 1 : 2,
  }),

  header: {
    display: 'grid',
    gap: 0.25,
  },

  metaGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1,
  },

  metaItem: {
    minWidth: 0,
    p: 1.25,
    borderRadius: 'md',
  },

  querySnapshot: {
    display: 'grid',
    gap: 1.25,
    p: 1.25,
    borderRadius: 'md',
  },

  querySnapshotHeader: {
    display: 'grid',
    gap: 0.25,
  },

  queryGroup: {
    display: 'grid',
    gap: 0.75,
  },

  queryGroupLabel: {
    color: 'text.tertiary',
  },

  queryChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
  },

  filters: {
    p: 1.25,
    borderRadius: 'md',
  },

  filtersRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 1,
  },

  filterControl: {
    minWidth: 150,
  },

  searchInput: {
    minWidth: 190,
  },

  tableWrap: {
    borderRadius: 'md',
    overflow: 'auto',
  },

  table: ({ isPdf = false } = {}) => ({
    minWidth: isPdf ? 980 : 1120,

    '& th[data-sortable="true"]': {
      cursor: 'pointer',
      userSelect: 'none',
    },
  }),

  teamCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  empty: {
    display: 'grid',
    placeItems: 'center',
    minHeight: 220,
    p: 2,
  },
}
