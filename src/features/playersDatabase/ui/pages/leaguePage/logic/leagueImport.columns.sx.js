// features/playersDatabase/ui/pages/leaguePage/logic/leagueImport.columns.sx.js

export const leagueImportColumnsSx = {
  compactColumn: {
    width: 66,
    minWidth: 66,
  },

  numberInput: {
    minWidth: 48,
  },

  ltrNumberInput: {
    minWidth: 48,

    '& input': {
      direction: 'ltr',
      textAlign: 'left',
      fontSize: 12,
      fontWeight: 400,
    },
  },

  teamNameColumn: {
    width: 220,
    minWidth: 220,
  },

  teamIdentityColumn: {
    width: 280,
    minWidth: 280,
  },
}
