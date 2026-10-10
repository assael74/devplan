// src/features/playersDatabase/ui/components/modals/sx/steppedModal.sx.js

export const steppedModalSx = {
  layout: {
    minWidth: 0,
    minHeight: 0,
    boxSizing: 'border-box',
    height: {
      xs: 'min(560px, calc(100dvh - 290px))',
      md: 'min(700px, calc(100dvh - 310px))',
    },
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1.5,
    overflow: 'hidden',
  },

  destructiveLayout: {
    height: '100%',
  },

  stepContent: {
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    boxSizing: 'border-box',
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1fr)',
    overflow: 'hidden',
  },

  destructiveStepContent: {
    display: 'block',
    overflowY: 'auto',
  },
}
