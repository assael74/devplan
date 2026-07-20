// features/playersDatabase/components/summary/leagueList/leagueList.sx.js

const palette = {
  panel: '#ffffff',
  line: '#d8e0e7',
  ink: '#17202a',
  muted: '#64717f',
}

export const leagueListSx = {
  root: {
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: palette.panel,
    p: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: 0,
    height: '100%',
    maxHeight: {
      xs: 160,
      xl: 'none',
    },
    overflow: 'hidden',
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 0.35,
    minHeight: 0,
    overflow: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#b8c3cf transparent',
    p: 0.65,

    '&::-webkit-scrollbar': {
      width: 5,
      height: 5,
    },

    '&::-webkit-scrollbar-thumb': {
      borderRadius: 999,
      backgroundColor: '#b8c3cf',
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
  },

  item: {
    justifyContent: 'flex-start',
    minHeight: 42,
    borderRadius: '7px',
    textAlign: 'left',
    whiteSpace: 'normal',
    border: '1px solid transparent',
    flex: '0 0 auto',

    '&.isSelected': {
      bgcolor: '#e8f1ff',
      color: palette.ink,
      borderColor: '#b8d3ff',
      boxShadow: 'none',
    },

    '&.isSelected *': {
      color: `${palette.ink} !important`,
    },

    '&.isSelected:hover': {
      bgcolor: '#dceaff',
    },

    '&.MuiButton-plain': {
      color: palette.ink,
    },

    '&.MuiButton-plain:hover': {
      bgcolor: '#f1f5f9',
    },
  },

  text: {
    minWidth: 0,
    width: '100%',
  },

  itemTitle: {
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  meta: {
    color: palette.muted,
    mt: 0.15,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
    alignItems: 'center',
    lineHeight: 1.25,
  },

  metaChip: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 18,
    borderRadius: '999px',
    px: 0.75,
    bgcolor: '#eef4fb',
    color: '#344253',
    fontSize: 10.5,
    fontWeight: 700,
  },

  metaChipWarning: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 18,
    borderRadius: '999px',
    px: 0.75,
    bgcolor: '#fff3d6',
    color: '#8a4b00',
    fontSize: 10.5,
    fontWeight: 700,
  },

  metaChipDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 18,
    borderRadius: '999px',
    px: 0.75,
    bgcolor: '#ffe5df',
    color: '#a32913',
    fontSize: 10.5,
    fontWeight: 700,
  },
}
