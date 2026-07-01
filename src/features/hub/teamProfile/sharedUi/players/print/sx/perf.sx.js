// features/hub/teamProfile/sharedUi/players/print/sx/perf.sx.js

export const perfSx = {
  tableWrap: {
    width: '100%',
    overflow: 'visible',
  },

  metricChips: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    gap: 0.35,
  },

  metricChip: ({ tone }) => ({
    minWidth: 42,
    maxWidth: 62,
    justifyContent: 'center',
    bgcolor: tone.bg,
    color: tone.text,
    border: `1px solid ${tone.border}`,
    fontSize: 8.5,
    fontWeight: 700,
    '--Chip-minHeight': '20px',
    '--Chip-paddingInline': '0.3rem',
  }),

  performanceTopItems: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 0.3,
  },

  performanceTopChip: {
    minWidth: 46,
    maxWidth: 104,
    fontSize: 8.5,
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
    '--Chip-minHeight': '21px',
    '--Chip-paddingInline': '0.45rem',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  performanceIconChip: {
    width: 27,
    minWidth: 27,
    maxWidth: 27,
    '--Chip-paddingInline': 0,

    '& .MuiChip-label': {
      display: 'none',
    },
  },
}
