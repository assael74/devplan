// features/playersDatabase/components/leagues/players/teamPlayers.sx.js

const palette = {
  ink: '#17202a',
  muted: '#64717f',
  line: '#d8e0e7',
}

export const teamPlayersSx = {
  root: {
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: '30px auto minmax(0, 1fr)',
    gap: 0.35,
    p: 0,
    borderRadius: '8px',
    overflow: 'hidden',
  },

  delBar: {
    minHeight: 42,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    px: 1,
    border: '1px solid #f2a3a3',
    borderRadius: '8px',
    bgcolor: '#fff1f1',
    color: '#7f1d1d',

    '& .MuiButton-root': {
      minHeight: 26,
      fontSize: 12,
      fontWeight: 700,
    },
  },

  delMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    fontSize: 12,
    fontWeight: 700,
    ml: 'auto',
  },

  delCount: {
    px: 1,
    py: 0.35,
    borderRadius: 999,
    bgcolor: '#f5f7fa',
    color: palette.ink,
    fontSize: 12,
    fontWeight: 700,
  },

  spacer: {
    flex: 1,
  },
}
