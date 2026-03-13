// src/features/players/components/preview/PreviewDomainCard/PreviewDomainCardOverlay.sx.js

export const overlaySx = {
  dialogContentSx: {
    opacity: 0.6,
  },

  dividerSx: {
    mt: -1,
    flexShrink: 0,
  },

  modalSx: (nodeRef, state) => ({
    ref: nodeRef,
    keepMounted: true,
    open: state !== 'exited',
    slotProps: {
      backdrop: {
        sx: {
          opacity: 0,
          backdropFilter: 'blur(0px)',
          backgroundColor: 'rgba(15, 23, 42, 0.12)',
          transition:
            'opacity 320ms ease, backdrop-filter 320ms ease, background-color 320ms ease',
          ...{
            entering: {
              opacity: 1,
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(15, 23, 42, 0.22)',
            },
            entered: {
              opacity: 1,
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(15, 23, 42, 0.22)',
            },
            exiting: {
              opacity: 0,
              backdropFilter: 'blur(0px)',
              backgroundColor: 'rgba(15, 23, 42, 0.12)',
            },
          }[state],
        },
      },
    },
    sx: {
      visibility: state === 'exited' ? 'hidden' : 'visible',
    },
  }),

  modalDialogSx: (state) => ({
    sx: {
      display: 'flex',
      flexDirection: 'column',

      /* מודאל יציב */
      width: 'min(980px, calc(100vw - 32px))',
      maxWidth: '980px',

      height: 'min(88dvh, 920px)',
      maxHeight: 'min(88dvh, 920px)',

      boxSizing: 'border-box',
      overflow: 'hidden',

      opacity: 0,
      transform: 'translateY(18px) scale(0.985)',
      transformOrigin: 'center center',
      transition:
        'opacity 320ms cubic-bezier(0.22,1,0.36,1), transform 320ms cubic-bezier(0.22,1,0.36,1)',

      ...{
        entering: {
          opacity: 1,
          transform: 'translateY(0) scale(1)',
        },
        entered: {
          opacity: 1,
          transform: 'translateY(0) scale(1)',
        },
        exiting: {
          opacity: 0,
          transform: 'translateY(10px) scale(0.992)',
        },
      }[state],
    },
  }),

  drawerSlotProps: {
    content: {
      sx: {
        bgcolor: 'transparent',
        p: { xs: 0, md: 2.5 },
        boxShadow: 'none',
        height: '100dvh',
      },
    },
  },

  drawerSheetSx: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderRadius: { xs: 0, md: 'xl' },
    overflow: 'hidden',
    boxShadow: { xs: 'none', md: 'lg' },
    mx: { xs: 0, md: 'auto' },
    width: { xs: '100%', md: 'min(980px, calc(100% - 24px))' },
  },

  handleWrapSx: {
    display: 'flex',
    justifyContent: 'center',
    pt: 1,
    pb: 0.5,
    bgcolor: 'background.surface',
    flexShrink: 0,
  },

  handleBarSx: {
    width: 56,
    height: 5,
    borderRadius: 999,
    bgcolor: 'neutral.300',
    opacity: 0.9,
  },

  headerWrapSx: {
    px: { xs: 1.25, md: 2 },
    pb: 1.25,
    pt: 0.25,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    flexShrink: 0,
  },

  headerMainSx: {
    flex: 1,
    minWidth: 0,
  },

  closeBtnSx: {
    mt: 0.25,
    flexShrink: 0,
    borderRadius: 'md',
  },

  bodyScrollSx: {
    flex: 1,
    minHeight: 0,
    overflowY: 'scroll',
    overflowX: 'hidden',
    scrollbarGutter: 'stable both-edges',
    p: { xs: 1, md: 1.5 },
  },
}
