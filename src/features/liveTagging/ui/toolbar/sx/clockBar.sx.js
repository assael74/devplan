// src/features/liveTagging/ui/sx/clockBar.sx.js

export const clockBarSx = {
  clockBar: running => ({
    position: 'sticky',
    top: 0,
    zIndex: 20,
    bgcolor: running ? 'success.softBg' : 'background.surface',
    border: '1px solid',
    borderColor: running ? 'success.outlinedBorder' : 'divider',
    borderRadius: 'lg',
    px: {
      xs: 0.85,
      md: 1,
    },
    py: {
      xs: 0.65,
      md: 0.75,
    },
    display: 'grid',
    gridTemplateColumns: {
      xs: 'minmax(78px, .8fr) minmax(0, 1.2fr)',
      md: 'minmax(110px, auto) auto minmax(0, 1fr)',
    },
    alignItems: 'center',
    gap: {
      xs: 0.75,
      md: 1,
    },
    boxShadow: running ? 'sm' : 'xs',
  }),

  clockMain: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
  },

  clockLabel: {
    color: 'text.tertiary',
    lineHeight: 1,
  },

  clockText: {
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: 1,
    fontSize: {
      xs: 28,
      sm: 32,
      md: 34,
    },
  },

  clockPrimaryControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: {
      xs: 'flex-end',
      md: 'flex-start',
    },
    gap: {
      xs: 0.45,
      md: 0.6,
    },
    minWidth: 0,
  },

  toggleButton: running => ({
    minHeight: {
      xs: 38,
      md: 34,
    },
    minWidth: {
      xs: 74,
      md: 84,
    },
    px: {
      xs: 1,
      md: 1.25,
    },
    borderRadius: 'lg',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    boxShadow: running ? 'sm' : 'none',
  }),

  speedButton: {
    minHeight: {
      xs: 34,
      md: 32,
    },
    minWidth: {
      xs: 44,
      md: 48,
    },
    px: {
      xs: 0.75,
      md: 1,
    },
    borderRadius: 'md',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  resetButton: {
    minHeight: {
      xs: 34,
      md: 32,
    },
    minWidth: {
      xs: 34,
      md: 32,
    },
    borderRadius: 'md',
  },

  clockEdit: {
    display: {
      xs: 'none',
      md: 'flex',
    },
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.6,
    minWidth: 0,
  },

  clockInput: {
    width: 70,
  },

  setTimeButton: {
    fontSize: 11,
    whiteSpace: 'nowrap',
  },
}
