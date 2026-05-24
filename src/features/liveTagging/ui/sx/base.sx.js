// src/features/liveTagging/ui/sx/base.sx.js

export const baseSx = {
  panel: {
    height: '100dvh',
    maxHeight: '100dvh',
    overflowY: 'auto',
    overflowX: 'hidden',
    bgcolor: 'background.body',
    p: 1,
    display: 'grid',
    gap: 1,
    alignContent: 'start',
    WebkitOverflowScrolling: 'touch',
  },

  mutedText: {
    color: 'text.tertiary',
  },
  
  dataErrorBox: {
    bgcolor: 'danger.softBg',
    border: '1px solid',
    borderColor: 'danger.outlinedBorder',
    borderRadius: 'lg',
    p: 1,
  },
}
