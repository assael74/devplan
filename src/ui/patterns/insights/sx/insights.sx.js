//  ui/patterns/insights/sx/insights.sx.js

export const insightsPatternSx = {
  drawerSx: {
    bgcolor: 'transparent',
    p: { md: 3, sm: 0 },
    boxShadow: 'none',
  },

  drawerContentMobile: {
    p: 0,
    m: 0,
    boxShadow: 'none',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    height: '100dvh',
    maxHeight: '100dvh',
  },

  drawerSheet: {
    borderRadius: 'md',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    height: '100%',
    overflow: 'auto',
    bgcolor: 'background.body',
    pb: 1,
    pr: 0.2,
  },

  drawerSheetMobile: {
    width: '100%',
    height: '100dvh',
    maxHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  dialogContentMobile: {
    gap: 2,
    flex: 1,
    minHeight: 0,
    p: 0,
  },

  headerWrap: {
    p: 1,
    bgcolor: 'background.surface',
    borderBottom: '1px solid',
    borderColor: 'divider'
  },

  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  formNameSx: {
    px: 0.25,
    fontWeight: 600,
    textAlign: 'center',
  },

  content: {
    display: 'grid',
    gap: 1.25,
    py: 0.25,
    px: 1,
    overflowY: 'auto',
    minHeight: 0,
    flex: 1,
    bgcolor: 'transparent',
  },

  sectionBlock: {
    display: 'grid',
    gap: 0.85,
    p: 1,
    borderRadius: 16,
    bgcolor: 'background.surface',
    boxShadow: 'sm',
    position: 'relative',
  },

  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.7,
  },

  sectionIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 999,
    bgcolor: 'background.level1',
    flexShrink: 0,
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 1,
  },

  statCard: {
    gap: 0.15,
    p: 1,
    borderRadius: 12,
    minHeight: 40,
    bgcolor: 'background.level1',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
  },

  statsValue: {
    fontWeight: 700,
    ml: 'auto',
    borderRadius: 'sm',
    px: 0.5,
    bgcolor: 'background.level2',
  },

  statCardHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    minWidth: 0,
  },

  iconWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    borderRadius: 999,
    bgcolor: 'background.level2',
    flexShrink: 0,
  },

  chipsWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
    flexWrap: 'wrap',
  },
}
