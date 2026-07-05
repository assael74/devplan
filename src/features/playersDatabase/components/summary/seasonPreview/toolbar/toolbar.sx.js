// features/playersDatabase/components/summary/seasonPreview/toolbar/toolbar.sx.js

export const toolbarSx = {
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

  title: {
    fontWeight: 700,
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
}
