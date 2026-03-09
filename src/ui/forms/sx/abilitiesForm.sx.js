// C:\projects\devplan\src\ui\forms\sx\abilities\abilitiesForm.sx.js
export const vaSx = {
  root: { display: 'grid', gap: 1 },

  stickyHeader: {
    position: 'sticky',
    top: -18,
    zIndex: 30,
    bgcolor: 'background.surface',
    pb: 1,
    mb: 0.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  // scrollable body
  scrollWrap: {
    maxHeight: 'none',
    overflowY: 'auto',
    overflowX: 'hidden',
    pr: 0.25,
  },

  topRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    alignItems: 'start',
  },

  datePill: {
    px: 1,
    py: 0.75,
    borderRadius: 10,
    minHeight: 36,
    width: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    opacity: 0.9,
  },

  divider: { my: 1, px: 1 },

  headerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 0.75,
    pb: 2,
    px: 1,
    borderRadius: 'sm',
    boxShadow: 'lg'
  },

  overallScore: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  overallChip: { minWidth: 86, justifyContent: 'center' },

  growthStageCard: {
    mb: 1,
    px: 1,
    py: 1,
    borderRadius: 12,
  },

  growthStageRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  growthStageMissing: {
    border: '1px solid',
    borderColor: 'danger.outlinedBorder',
  },

  accGroup: { display: 'grid', gap: 1 },

  accRoot: (disabled) => ({
    borderRadius: 12,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    overflow: 'hidden',
    opacity: disabled ? 0.55 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  }),

  accSummary: {
    py: 0.6,
    px: 1,
    gap: 1,
    alignItems: 'center',
  },

  domainTitleBox: { minWidth: 0, flex: 1 },

  domainScoreBox: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 0.4,
    flexWrap: 'nowrap',
  },

  scoreChip: (selected) => ({
    cursor: 'pointer',
    minWidth: 25,
    minHeight: 24,
    fontSize: 12,
    justifyContent: 'center',
    px: 0.75,
    ...(selected ? {} : { opacity: 0.85 }),
  }),

  itemsGrid: { mt: 1, display: 'grid', gap: 0.6 },

  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    p: 0.65,
    borderRadius: 10,
    //border: 1,
    bgcolor: 'background.level1',
  },

  itemTitle: { flex: 1, minWidth: 0 },

  itemChips: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 0.4,
    flexWrap: 'wrap',
    flexShrink: 0,
    maxWidth: 380,
  },

  itemScoreChip: (selected) => ({
    cursor: 'pointer',
    minHeight: 24,
    px: 0.6,
    fontSize: 12,
    "--Chip-radius": "8px",
    ...(selected ? {} : { opacity: 0.85 }),
  }),

  compactSelect: {
    width: 120,
    border: 1,
    '--Select-minHeight': '32px',
    fontSize: 11,
  },

  resetBtn: {
    '--IconButton-size': '25px',
  }
}
