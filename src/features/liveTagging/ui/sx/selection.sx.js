// src/features/liveTagging/ui/sx/selection.sx.js

export const selectionSx = {
  selectionWrap: {
    display: 'grid',
    gap: 0.75,
  },

  selectionMobileCard: (ready) => ({
    display: {
      xs: 'grid',
      sm: 'none',
    },
    gridTemplateColumns: '1fr 1fr',
    gap: 1,
    bgcolor: ready ? 'primary.softBg' : 'background.surface',
    border: '1px solid',
    borderColor: ready ? 'primary.outlinedBorder' : 'divider',
    borderRadius: 'lg',
    p: 1,
    cursor: 'pointer',
    boxShadow: ready ? 'sm' : 'none',
  }),

  selectionMobileTitle: {
    fontWeight: 700,
    lineHeight: 1.25,
  },

  selectionMobileSub: {
    fontWeight: 600,
    lineHeight: 1.25,
  },

  selectionDesktop: {
    display: {
      xs: 'none',
      sm: 'grid',
    },
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'lg',
    p: 1,
    gap: 0.75,
  },

  selectionFields: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'auto minmax(180px, 1fr) minmax(220px, 1.4fr)',
    },
    gap: 0.75,
    alignItems: 'end',
  },

  selectionTypeActions: {
    display: 'flex',
    gap: 0.5,
    pb: 0.1,
  },

  selectionDrawer: {
    maxHeight: '88dvh',
    bgcolor: 'background.body',
    borderTopRightRadius: 'xl',
    borderTopLeftRadius: 'xl',
    p: 1,
    overflowY: 'auto',
  },

  selectionDrawerHead: {
    display: 'grid',
    gap: 0.35,
    pb: 1,
    pr: 4,
  },
}
