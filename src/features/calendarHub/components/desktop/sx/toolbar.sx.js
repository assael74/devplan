// src/features/calendar/toolbar.sx.js

export const toolbarSx =  {
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    p: 1.25,
    borderBottom: '1px solid',
    borderColor: 'divider',
    flexWrap: 'wrap',
  },

  buttonGroup: {
    direction: 'rtl',
    '& .MuiButton-root': {
      borderRadius: 0,
    },
    '& .MuiButton-root:first-of-type': {
      borderTopRightRadius: '8px',
      borderBottomRightRadius: '8px',
    },
    '& .MuiButton-root:last-of-type': {
      borderTopLeftRadius: '8px',
      borderBottomLeftRadius: '8px',
    },
  },

  chips: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    marginInlineStart: 'auto',
    flexWrap: 'wrap',
  },

  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 220,
  },
}
