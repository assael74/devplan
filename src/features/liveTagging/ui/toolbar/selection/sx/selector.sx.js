// src/features/liveTagging/ui/toolbar/selection/sx/selector.sx.js

export const selectorSx = {
  selectionWrap: {
    display: 'grid',
    gap: 0.75,
  },

  mutedText: {
    color: 'text.tertiary',
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

  selectionDrawer: {
    maxHeight: '88dvh',
    minHeight: {
      xs: '64dvh',
      sm: 'auto',
    },
    bgcolor: 'background.body',
    borderTopRightRadius: 'xl',
    borderTopLeftRadius: 'xl',
    p: 1.25,
    overflowY: 'auto',
  },

  selectionDrawerInner: {
    minHeight: {
      xs: 'calc(64dvh - 24px)',
      sm: 'auto',
    },
    display: 'flex',
    flexDirection: 'column',
    gap: 1.15,
  },

  selectionDrawerFooter: {
    mt: {
      xs: 'auto',
      sm: 0,
    },
    pt: 0.75,
  },

  selectionConfirmButton: {
    minHeight: 46,
    borderRadius: 'lg',
    fontWeight: 700,
  },

  selectionDrawerHead: {
    display: 'grid',
    gap: 0.35,
    pr: 4,
    mb: 1,
    borderBottom: '1px solid',
    borderColor: 'divider'
  },

  selectionDrawerTitle: {
    fontWeight: 700,
  },
}
