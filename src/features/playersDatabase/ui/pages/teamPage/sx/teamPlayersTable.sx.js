// features/playersDatabase/ui/pages/teamPage/sx/TeamPlayersTable.sx.js

export const teamPlayersTableSx = {
  tableWrap: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    border: 0,
    borderRadius: 0,
  },

  playersTable: {
    width: '100%',
    minWidth: 0,
    tableLayout: 'fixed',

    '& th, & td': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    '& th[data-column="fullName"], & td[data-column="fullName"]': {
      textAlign: 'left',
    },
  },
}
