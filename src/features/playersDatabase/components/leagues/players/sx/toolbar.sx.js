// features/playersDatabase/components/leagues/players/toolbar.sx.js

export const toolbarSx = {
  actionBar: {
    minHeight: 0,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 0.75,
    px: 0.25,

    '& .MuiButton-root': {
      minHeight: 26,
      fontSize: 12,
      fontWeight: 700,
    },
  },

  viewChip: {
    minHeight: 24,
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },

  spacer: {
    flex: 1,
  },
}
