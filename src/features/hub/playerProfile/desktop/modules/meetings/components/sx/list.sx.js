// playerProfile/desktop/modules/meetings/components/sx/list.sx.js

export const listSx = {
  root: (active, tone) => ({
    mb: 1,
    p: 1,
    border: 'none',
    borderRadius: 'xl',
    bgcolor: 'background.surface',
    boxShadow: active
      ? `${tone?.glow || '0 10px 28px rgba(25, 118, 210, 0.16)'}, 0 2px 10px rgba(15, 23, 42, 0.08)`
      : '0 2px 10px rgba(15, 23, 42, 0.06)',
    cursor: 'pointer',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
    '&:active': {
      transform: 'scale(0.995)',
    },
    '&:hover': {
      boxShadow: active
        ? `${tone?.glow || '0 10px 28px rgba(25, 118, 210, 0.16)'}, 0 8px 18px rgba(15, 23, 42, 0.10)`
        : '0 8px 18px rgba(15, 23, 42, 0.10)',
    },
  }),

  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  titleWrap: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
  },

  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0.75,
    minWidth: 0,
  },

  leadingIcon: (tone) => ({
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: tone?.statusBg || 'primary.softBg',
    color: tone?.statusColor || 'primary.softColor',
  }),

  dateRow: {
    mt: 0.35,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    color: 'text.secondary',
    minWidth: 0,
  },

  statusChip: (tone) => ({
    bgcolor: tone?.statusBg || 'primary.softBg',
    color: tone?.statusColor || 'primary.softColor',
    fontWeight: 700,
  }),

  boxType: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 1,
    alignItems: 'flex-start'
  },

  middleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 0.5,
  },

  bottomRow: {
    pt: 0.75,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid',
    borderColor: 'divider',
  },

  timeLabel: (tone) => ({
    fontWeight: 700,
    color: tone?.statusColor || 'primary.softColor',
  }),

  iconItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    width: '100%',
  },

  statusItem: {
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    mt: 0.5,
    justifyContent: 'flex-start',
  },

  listWrap: {
    overflow: 'auto',
    px: 0.75,
    pb: 1.5,
    flex: 1,
    minHeight: 0
  },

  rightPane: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },

  rightTop: {
    p: 1.25,
    py: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    zIndex: 2,
    bgcolor: 'background.surface',
    gap: 1,
  },

  countBox: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
    justifyContent: 'flex-start',
    px: 1,
    pb: 0.5
  },

  grid: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: '1fr 1fr 1fr',
  },

  monthBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    width: '100%'
  },

  renderVal: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0
  },

  renderOp: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    width: '100%'
  }
}
