// features/playersDatabase/ui/pages/teamPage/sx/teamPlayers.columns.sx.js

export const teamPlayersColumnsSx = {
  playerStatusBadge: color => ({
    width: 20,
    height: 20,
    minWidth: 20,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: `var(--joy-palette-${color}-700)`,
    bgcolor: `var(--joy-palette-${color}-100)`,
    border: `1px solid var(--joy-palette-${color}-300)`,
    lineHeight: 1,

    '& svg': {
      fontSize: 13,
    },
  }),

  profileCell: {
    width: '100%',
    minWidth: 0,
    py: 0.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
  },
}
