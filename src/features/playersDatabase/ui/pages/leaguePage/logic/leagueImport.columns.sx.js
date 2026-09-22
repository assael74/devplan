const LEAGUE_IMPORT_COLUMN_LAYOUT = {
  rank: {
    width: '6%',
    minWidth: 64,
  },
  teamName: {
    width: '18%',
    minWidth: 200,
  },
  teamIdentity: {
    width: '26%',
    minWidth: 280,
  },
  number: {
    width: '6.25%',
    minWidth: 66,
  },
}

export const leagueImportColumnsSx = {
  rankColumn: {
    ...LEAGUE_IMPORT_COLUMN_LAYOUT.rank,
  },

  compactColumn: {
    ...LEAGUE_IMPORT_COLUMN_LAYOUT.number,
  },

  numberInput: {
    minWidth: 0,
  },

  ltrNumberInput: {
    minWidth: 0,
    direction: 'ltr',
    textAlign: 'center',
  },

  textHeader: {
    justifyContent: 'flex-start',
    textAlign: 'right',
  },

  textCellContent: {
    justifyContent: 'flex-start',
    textAlign: 'right',
  },

  teamNameColumn: {
    ...LEAGUE_IMPORT_COLUMN_LAYOUT.teamName,
    textAlign: 'right',
  },

  teamIdentityColumn: {
    ...LEAGUE_IMPORT_COLUMN_LAYOUT.teamIdentity,
    textAlign: 'right',
  },
}
