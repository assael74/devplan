// src/features/playersDatabase/components/leagues/board/sx/season.sx.js

const palette = {
  panel: '#ffffff',
  seasonPanel: '#fbfefc',
  seasonSoft: '#f0f8f3',
  line: '#d8e0e7',
  greenLine: '#cbe5d2',
  muted: '#64717f',
  red: '#b42318',
  redSoft: '#ffe9e7',
}

export const seasonSx = {
  panel: {
    bgcolor: palette.seasonPanel,
    border: `1px solid ${palette.greenLine}`,
    borderRadius: '8px',
    p: 0.75,
    minWidth: 0,
    width: '100%',
    justifySelf: 'stretch',
    alignSelf: 'stretch',
    minHeight: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    mb: 0.65,

    '& button': {
      minHeight: 30,
      borderRadius: '8px',
    },
  },

  addButton: {
    width: 32,
    minWidth: 32,
    minHeight: 32,
    px: 0,
    fontWeight: 700,
    flexShrink: 0,
    borderRadius: '8px',
  },

  list: {
    display: 'grid',
    gap: 0.4,
    alignContent: 'start',
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#b7c8bd transparent',
    pr: 0.15,

    '&::-webkit-scrollbar': {
      width: 5,
      height: 5,
    },

    '&::-webkit-scrollbar-thumb': {
      borderRadius: 999,
      backgroundColor: '#b7c8bd',
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
  },

  item: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'minmax(0, 1fr)',
    },
    gap: 0.4,
    alignItems: 'start',
    border: `1px solid ${palette.greenLine}`,
    borderRadius: '7px',
    bgcolor: palette.seasonSoft,
    px: 0.65,
    py: 0.55,
    minHeight: 66,
  },

  text: {
    minWidth: 0,
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.2,
  },

  meta: {
    color: palette.muted,
    mt: 0.25,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.45,
    alignItems: 'center',
    fontSize: 11,
    lineHeight: 1.2,

    '& span': {
      minWidth: 0,
    },
  },

  stats: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.35,
    alignItems: 'center',

    '& .MuiChip-root': {
      minHeight: 20,
      fontSize: 10.5,
      fontWeight: 700,
    },
  },

  add: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: '1.2fr 1fr 1fr auto',
    },
    gap: 0.5,
    alignItems: 'center',
    mt: 0.75,
    pt: 0.75,
    borderTop: `1px solid ${palette.greenLine}`,

    '& input': {
      fontSize: 12,
    },
  },

  saveButton: {
    minWidth: 72,
    px: 1,
    fontWeight: 700,
  },

  empty: {
    minHeight: 54,
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    border: `1px dashed ${palette.greenLine}`,
    borderRadius: '7px',
    bgcolor: palette.seasonSoft,
    color: palette.muted,
    fontWeight: 700,
  },

  error: {
    mt: 1,
    p: 0.85,
    borderRadius: '8px',
    bgcolor: palette.redSoft,
    color: palette.red,
    fontWeight: 700,
  },
}
