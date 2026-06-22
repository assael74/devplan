// src/features/playersDatabase/components/leagues/board/sx/header.sx.js

const palette = {
  line: '#d8e0e7',
  muted: '#64717f',
}

export const headerSx = {
  top: {
    p: 1.5,
    borderBottom: `1px solid ${palette.line}`,
    display: 'flex',
    flexDirection: {
      xs: 'column',
      lg: 'row',
    },
    justifyContent: 'space-between',
    alignItems: {
      xs: 'stretch',
      lg: 'center',
    },
    gap: 1.5,
  },

  title: {
    fontWeight: 700,
  },

  meta: {
    color: palette.muted,
    mt: 0.25,
  },

  controls: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
    justifyContent: {
      xs: 'space-between',
      lg: 'flex-start',
    },
  },
}
