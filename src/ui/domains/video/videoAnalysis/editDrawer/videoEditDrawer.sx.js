// sC:\projects\devplan\src\ui\domains\video\videoAnalysis\drawer\videoEditDrawer.sx.js
import { getEntityColors } from '../../../../../ui/core/theme/Colors'

export const buildVideoEditDrawerSx = (entityType) => ({
  content: { p: 0, bgcolor: 'transparent', height: '100vh', maxHeight: '100vh' },

  sheet: {
    height: '100%',
    maxHeight: '100%',
    width: { xs: '100vw', sm: '100%' },
    display: 'flex',
    borderTopLeftRadius: 16,
    flexDirection: 'column',
  },

  header: {
    display: 'flex',
    borderTopLeftRadius: 16,
    alignItems: 'center',
    gap: 1,
    p: 1.25,
    bgcolor: getEntityColors(entityType)?.bg,
  },

  cardTitle: {
    lineHeight: 1.1,
    maxWidth: '100%',
  },

  body: { display: 'grid', gap: 1, px: 4, py: 1 },

  footer: {
    mt: 'auto',
    p: 1.25,
    borderTop: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  btnSave: {
    bgcolor: getEntityColors(entityType)?.bg,
    '&:hover': { bgcolor: `color-mix(in srgb, ${getEntityColors(entityType)?.bg} 85%, black)` },
    '&:active': { bgcolor: `color-mix(in srgb, ${getEntityColors(entityType)?.bg} 75%, black)` }
  }
})
