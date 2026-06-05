// src/features/liveTagging/model.sx.js

const footerSide = side => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: side === 'end' ? 'flex-end' : 'flex-start',
  gap: 0.6,
  minWidth: 0,
})

export const modelSx = {
  mobile: {
    root: {
      display: {
        xs: 'grid',
        md: 'none',
      },
      alignContent: 'start',
      gap: 0.75,
      minHeight: '100dvh',
      p: 0.75,
      pb: '78px',
    },

    messageBox: tone => ({
      bgcolor: `${tone}.softBg`,
      border: '1px solid',
      borderColor: `${tone}.outlinedBorder`,
      borderRadius: 'lg',
      p: 0.75,
    }),

    footer: {
      position: 'fixed',
      right: 0,
      left: 0,
      bottom: 0,
      zIndex: 40,
      bgcolor: 'background.surface',
      borderTop: '1px solid',
      borderColor: 'divider',
      boxShadow: 'lg',
      px: 1,
      py: 0.65,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
    },

    footerSide,

    footerButton: {
      minHeight: 38,
      minWidth: 52,
      px: 0.75,
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    },

    footerMainButton: {
      minHeight: 40,
      minWidth: 72,
      px: 1.1,
      fontSize: 13,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    },
  },

  desktop: {
    root: {
      display: {
        xs: 'none',
        md: 'flex',
      },
      flexDirection: 'column',
      minHeight: 'calc(100dvh - 132px)',
      gap: 1,
      p: 1,
    },

    content: {
      display: 'grid',
      alignContent: 'start',
      gap: 1,
    },

    messageBox: tone => ({
      bgcolor: `${tone}.softBg`,
      border: '1px solid',
      borderColor: `${tone}.outlinedBorder`,
      borderRadius: 'lg',
      p: 1,
    }),

    footer: {
      mt: 'auto',
      bgcolor: 'background.surface',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 'lg',
      boxShadow: 'sm',
      px: 1,
      py: 0.75,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      flexShrink: 0,
    },

    footerSide,

    footerButton: {
      minHeight: 34,
      minWidth: 72,
      px: 1.25,
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    },

    footerMainButton: {
      minHeight: 36,
      minWidth: 108,
      px: 1.75,
      fontSize: 13,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    },
  },
}
