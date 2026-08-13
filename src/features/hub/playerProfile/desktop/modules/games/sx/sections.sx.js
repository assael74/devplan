// hub/playerProfile/desktop/modules/games/sx/sections.sx.js

export const sectionsSx = {
  infoCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    px: 1,
  },

  titleSx: {
    minWidth: 0,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: 1.25,
  },

  metaItemSx: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
    color: 'text.secondary',
  },

  resultCellSx: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'start',
    justifyItems: 'center',
    gap: 0.55,
    px: 1,
    textAlign: 'center',
  },

  impactCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyItems: 'start',
    gap: 0.55,
    px: 1,
  },

  entryCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyItems: 'start',
    gap: 1,
    px: 0.35,
    overflow: 'hidden',

    '& .MuiIconButton-root': {
      flex: '0 0 auto',
    },

    '& .MuiChip-root': {
      minWidth: 0,
      maxWidth: 77,
      flex: '0 1 auto',
    },

    '& .MuiChip-label': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  entryStatusChipSx: {
    //width: 74,
    //flex: '0 0 74px',
    justifyContent: 'center',
  },

  entryTimeChipSx: {
    //width: 58,
    //flex: '0 0 58px',
    justifyContent: 'center',
  },
}
