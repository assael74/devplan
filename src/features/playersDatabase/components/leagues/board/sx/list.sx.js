// src/features/playersDatabase/components/leagues/board/sx/list.sx.js

const palette = {
  panel: '#ffffff',
  line: '#d8e0e7',
  ink: '#17202a',
  muted: '#64717f',
}

export const listSx = {
  root: {
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: palette.panel,
    p: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 0.5,
    maxHeight: {
      xs: 160,
      xl: 'calc(100vh - 292px)',
    },
    overflow: 'auto',
  },

  toolbar: {
    flex: '0 0 auto',
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 0.5,
    minHeight: 0,
    overflow: 'auto',
  },

  item: {
    justifyContent: 'flex-start',
    minHeight: 56,
    borderRadius: '8px',
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

  title: {
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  meta: {
    color: palette.muted,
    mt: 0.25,
  },
}
