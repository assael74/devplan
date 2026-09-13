export const playerPageSx = {
  mainColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
    overflowX: 'hidden',
    overflowY: 'auto',
    pr: 0.25,

    '& > *': {
      flexShrink: 0,
      minWidth: 0,
    },
  },
}
