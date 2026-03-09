// C:\projects\devplan\src\ui\patterns\schedule\sx\schedulePreview.sx.js
export const schedulePreviewSx = {
  root: (mode = 'profile') => ({
    display: 'grid',
    gap: mode === 'modal' ? 0.7 : 1,
    minWidth: 0,
    minHeight: 0,
    height: '100%',
  }),

  header: (mode = 'profile') => ({
    p: mode === 'modal' ? 0.85 : 1.1,
    borderRadius: 'lg',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    background:
      'linear-gradient(135deg, rgba(76,110,245,0.10) 0%, rgba(34,197,94,0.08) 100%)',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'sm',
  }),

  headerTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
    minWidth: 0,
  },

  headerDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    bgcolor: 'primary.500',
    boxShadow: '0 0 0 4px rgba(76,110,245,0.12)',
    flexShrink: 0,
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },

  headerStats: (mode = 'profile') => ({
    display: 'flex',
    alignItems: 'center',
    gap: mode === 'modal' ? 0.35 : 0.5,
    flexWrap: 'wrap',
  }),

  statChip: (mode = 'profile') => ({
    fontWeight: 700,
    ...(mode === 'modal'
      ? {
          height: 24,
          fontSize: 11,
          px: 0.7,
        }
      : {}),
  }),

  createBtn: (c) => ({
    bgcolor: c.bg,
    color: c.text,
    transition: 'filter .15s ease, transform .12s ease',
    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  }),

  weeksGrid: (mode = 'profile') => ({
    display: 'grid',
    gridTemplateColumns: mode === 'profile' ? '1fr 1fr' : '1fr',
    gap: mode === 'modal' ? 0.75 : 0.9,
    minWidth: 0,
    minHeight: 0,
    height: '100%',
  }),
}
