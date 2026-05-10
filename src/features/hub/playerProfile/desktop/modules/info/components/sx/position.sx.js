
export const positionSx = {
  card: {
    p: 1.25,
    borderRadius: 'md',
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },

  headWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
    mb: 1
  },

  headSecondWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    minWidth: 0
  },

  positionGrid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    width: '100%',
    maxWidth: 660,
    mx: 'auto',

    '& > *': {
      width: '100%',
    },
  },

  positionHeadRow: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: '190px minmax(140px, .8fr) minmax(120px, .6fr) minmax(220px, 1fr) auto',
    },
    gap: 1,
    alignItems: 'center',
    minWidth: 0,
    mb: 1,
  },

  positionInfoItem: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
    p: 1,
    borderRadius: 'sm',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  positionInfoLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  },

  positionInfoValue: {
    fontWeight: 700,
    lineHeight: 1.25,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  positionInfoSub: {
    color: 'text.secondary',
    lineHeight: 1.25,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}
