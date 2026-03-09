// src/ui/patterns/stickySections/stickySectionsByMonth.sx.js
export const stickySectionsByMonthSx = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },

  section: (isFirst) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
    mt: isFirst ? 0 : 0.75,
  }),

  header: (top, isFirst) => ({
    position: 'sticky',
    top: (top || 0) + (isFirst ? 0 : 8),
    zIndex: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 0.75,
    py: 0.5,
    bgcolor: 'neutral.softBg',
    borderRadius: 5,
  }),

  headerTitle: { minWidth: 0 },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 1,
  },

  cell: { minWidth: 0 },
}
