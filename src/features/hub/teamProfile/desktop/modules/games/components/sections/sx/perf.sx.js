// teamProfile/desktop/modules/games/components/sections/sx/perf.sx.js

export const perfSx = {
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.45,
    minWidth: 0,
    width: '100%',
    pl: 0.25,
    py: 0,
  },

  labelBox: {
    flex: '0 0 45px',
    width: 45,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  label: {
    color: 'text.tertiary',
    fontWeight: 700,
    fontSize: 11,
    lineHeight: 1.2,
    minWidth: 0,
    maxWidth: 28,
    textAlign: 'left',
  },

  content: {
    flex: '0 1 auto',
    minWidth: 0,
    display: 'grid',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.25,
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.7,
    minWidth: 0,
    overflow: 'hidden',
    flexWrap: 'nowrap',
  },

  chipsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.7,
    minWidth: 0,
    overflow: 'hidden',
    flexWrap: 'nowrap',
  },

  metricChip: {
    maxWidth: 78,
    minWidth: 0,
    justifyContent: 'center',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      minWidth: 0,
      overflow: 'hidden',
    },
  },

  metricChipText: {
    display: 'none',
  },

  metricChipValue: {
    fontSize: 12,
    fontWeight: 700,
    flex: '0 0 auto',
    textAlign: 'center',
  },

  playerChip: {
    maxWidth: 112,
    minWidth: 0,
    justifyContent: 'center',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      minWidth: 0,
      overflow: 'hidden',
    },
  },

  chipAvatar: {
    width: 16,
    height: 16,
    flex: '0 0 auto',
  },

  chipValue: {
    fontSize: 12,
    pl: 0.35,
    fontWeight: 700,
    flex: '0 0 auto',
  },

  chipText: {
    fontSize: 12,
    minWidth: 0,
    maxWidth: 64,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
}
