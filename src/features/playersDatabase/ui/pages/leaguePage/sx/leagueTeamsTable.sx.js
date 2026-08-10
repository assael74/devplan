// src/features/playersDatabase/ui/pages/leaguePage/sx/leagueTeamsTable.sx.js

export const leagueTeamsTableSx = {
  tableWrap: {
    border: 0,
    borderRadius: 0,
  },

  leagueTable: {
    '& th:first-of-type, & td:first-of-type': {
      textAlign: 'center',
      pr: 1,
      pl: 1,
    },

    '& th:nth-of-type(3), & td:nth-of-type(3)': {
      textAlign: 'left',
      pr: 1.5,
      pl: 1.5,
    },
  },
}
