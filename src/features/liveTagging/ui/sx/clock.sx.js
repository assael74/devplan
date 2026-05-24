// src/features/liveTagging/ui/sx/clock.sx.js

export const clockSx = {
  clockBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'lg',
    p: 1,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'auto 1fr',
    },
    gap: 1,
    boxShadow: 'sm',
  },

  clockTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5
  },

  clockMain: {
    minWidth: 110,
  },

  clockText: {
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: 1,
  },

  clockControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: {
      xs: 'flex-start',
      sm: 'flex-end',
    },
    gap: 0.75,
    flexWrap: 'wrap',
  },

  clockEdit: {
    gridColumn: {
      xs: '1',
      sm: '1 / -1',
    },
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  clockInput: {
    width: 76,
  },
}
