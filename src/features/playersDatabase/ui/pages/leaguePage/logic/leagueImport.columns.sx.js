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

  selectedClub: {
    minWidth: 0,
    fontWeight: 700,
  },

  clubColumn: {
    width: 210,
    minWidth: 210,
  },

  clubInput: {
    minWidth: 190,
  },

  teamNameColumn: {
    width: 170,
    minWidth: 170,
  },

  teamNameInput: {
    minWidth: 150,
  },

  teamSlotColumn: {
    width: 64,
    minWidth: 64,
  },

  teamSlotInput: {
    minWidth: 48,
  },

  teamUrlColumn: {
    width: 64,
    minWidth: 64,
    textAlign: 'center',
  },

  teamUrlIndicator: {
    textAlign: 'center',
    fontWeight: 700,
  },
}
