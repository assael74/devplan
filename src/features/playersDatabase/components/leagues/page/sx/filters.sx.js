// src/features/playersDatabase/components/leagues/page/sx/filters.sx.js

const palette = {
  line: '#d8e0e7',
  muted: '#64717f',
}

export const filtersSx = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
    alignItems: 'center',
  },

  group: {
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.35,
    p: 0.25,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#f8fafc',
    mx: 1
  },

  label: {
    color: palette.muted,
    fontWeight: 700,
    fontSize: 10.5,
    px: 0.35,
  },

  button: {
    minHeight: 24,
    px: 0.7,
    fontSize: 11.5,
    fontWeight: 700,
    borderRadius: '7px',
  },

  reset: {
    minWidth: 28,
    minHeight: 28,
    px: 0,
  },

  input: {
    width: 108,
    minHeight: 25,

    '& input': {
      py: 0.25,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: 700,
    },
  },

  profileSelect: {
    minWidth: 150,
    minHeight: 25,
    fontSize: 11.5,
    fontWeight: 700,
  },
}
