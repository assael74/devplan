// src/features/playersDatabase/ui/components/sync/syncStatusHeader.sx.js

export const syncStatusHeaderSx = {
  root: {
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  title: {
    minWidth: 0,
    flex: '1 1 auto',
  },

  receipt: {
    minWidth: 0,
    maxWidth: '50%',
    flex: '0 1 auto',
    color: 'text.tertiary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}
