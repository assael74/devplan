// playerProfile/mobile/modules/payments/sx/toolbar.sx.js

export const toolbarSx = {
  toolbar: {
    display: 'grid',
    gap: 0.75,
    p: 1,
    borderRadius: '16px',
    bgcolor: 'background.level',
  },

  topRow: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: 0.75,
    minWidth: 0,
    flexWrap: 'wrap',
  },

  tabsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
    flexWrap: 'wrap',
  },

  indicatorsRow: {
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  summaryScroll: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    overflowX: 'auto',
    overflowY: 'hidden',
    pb: 0.7,
    minWidth: 0,
    '& > *': {
      flex: '0 0 auto',
    },
  },

  tabsWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
    borderRadius: '16px'
  },

  tabs: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
    p: 0.75,
    borderRadius: '16px',
    bgcolor: 'background.level',
  },

  chip: {
    cursor: 'pointer',
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider'
  }
}
