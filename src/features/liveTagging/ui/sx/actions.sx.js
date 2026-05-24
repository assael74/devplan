// src/features/liveTagging/ui/sx/actions.sx.js

export const actionsSx = {
  actionsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  actionSplitTitleRow: {
    minHeight: 38,
    px: 0.75,
    py: 0.65,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
  },

  actionsSettingsDrawer: {
    maxHeight: '88dvh',
    bgcolor: 'background.body',
    borderTopRightRadius: 'xl',
    borderTopLeftRadius: 'xl',
    p: 1,
    overflowY: 'auto',
  },

  actionsSettingsHead: {
    display: 'grid',
    gap: 0.35,
    pb: 1,
    pr: 4,
  },

  actionsSettingsReset: {
    justifySelf: 'start',
    mt: 0.5,
  },

  actionsSettingsList: {
    display: 'grid',
    gap: 0.5,
  },

  actionsSettingsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'lg',
    p: 1,
  },

  actionsSettingsInfo: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  actionsSettingsTitle: {
    fontWeight: 700,
  },

  actionsPanel: {
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'lg',
    p: 1,
    display: 'grid',
    gap: 0.85,
  },

  actionsMainTitle: {
    fontWeight: 700,
  },

  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  actionSplitCard: {
    minWidth: 0,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
    borderRadius: 'lg',
    overflow: 'hidden',
    display: 'grid',
  },

  actionSplitTitle: {
    px: 0.75,
    py: 0.65,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 1.2,
    minHeight: 36,
    display: 'grid',
    placeItems: 'center',
  },

  actionSplitButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    borderTop: '1px solid',
    borderColor: 'divider',
  },

  actionHalfButton: (side) => ({
    minHeight: 42,
    borderRadius: 0,
    fontWeight: 700,
    lineHeight: 1.15,
    whiteSpace: 'normal',
    borderInlineStart: side === 'negative' ? '1px solid' : 0,
    borderColor: 'divider',
  }),
}
