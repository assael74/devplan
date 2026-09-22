// src/features/playersDatabase/ui/components/modals/paste/sx/pasteModal.sx.js

export const pasteModalSx = {
  modalContent: {
    p: {
      xs: 0.75,
      md: 1,
    },
    overflow: 'hidden',
  },

  content: {
    minWidth: 0,
    height: {
      xs: 'min(560px, calc(100dvh - 290px))',
      md: 'min(700px, calc(100dvh - 310px))',
    },
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1.5,
    overflow: 'hidden',
  },

  contentWithBefore: {
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
  },
}
