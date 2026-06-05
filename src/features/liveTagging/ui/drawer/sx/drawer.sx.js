export const drawerSx = {
  actionsSettingsDrawer: {
    maxHeight: '88dvh',
    bgcolor: 'background.body',
    borderTopRightRadius: 'xl',
    borderTopLeftRadius: 'xl',
    p: 1,
    overflowY: 'auto',
  },

  drawerActionTitle: (side) => ({
    fontWeight: 700,
    color: side === 'positive' ? 'success.700' : 'danger.700',
  }),

  zoneButton: (side) => ({
    minHeight: {
      xs: 58,
      sm: 68,
    },
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'rgba(255,255,255,0.55)',
    bgcolor: 'rgba(255,255,255,0.18)',
    color: 'common.white',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.16)',

    '&:hover': {
      bgcolor:
        side === 'negative'
          ? 'rgba(211,47,47,0.55)'
          : 'rgba(46,125,50,0.62)',
      borderColor: 'rgba(255,255,255,0.78)',
    },

    '&:active': {
      transform: 'scale(0.98)',
    },
  }),

  actionsSettingsHead: {
    display: 'grid',
    gap: 0.35,
    pb: 1,
    pr: 4,
  },

  mutedText: {
    color: 'text.tertiary',
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

  zonesDrawer: {
    maxHeight: '92dvh',
    bgcolor: 'background.body',
    borderTopRightRadius: 'xl',
    borderTopLeftRadius: 'xl',
    p: 1,
    overflowY: 'auto',
  },

  zonesDrawerHead: {
    display: 'grid',
    gap: 0.35,
    pb: 1,
    pr: 4,
  },

  pitchWrap: {
    bgcolor: '#14532d',
    border: '1px solid',
    borderColor: '#3fa65b',
    borderRadius: 'xl',
    p: 1,
    display: 'grid',
    gap: 0.75,
    boxShadow: 'md',
    backgroundImage:
      'linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px)',
    backgroundSize: '28px 28px',
  },

  pitchEdgeLabel: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: 700,
  },

  pitchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.65,
  },

  zoneNumber: {
    fontWeight: 700,
    color: 'common.white',
    fontSize: {
      xs: 20,
      sm: 24,
    },
  },
}
