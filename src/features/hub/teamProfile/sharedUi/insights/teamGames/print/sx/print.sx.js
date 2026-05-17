// teamProfile/sharedUi/insights/teamGames/print/sx/print.sx.js

export const printSx = {
  page: {
    width: '100%',
    maxWidth: 'none',
    bgcolor: '#fff',
    color: '#111827',
    p: 0,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    overflow: 'visible',
  },

  header: {
    pb: 2,
    mb: 2,
    borderBottom: '1px solid',
    borderColor: '#e5e7eb',
  },

  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 1,
    mb: 1,
  },

  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 1,
    mt: 1,
    mb: 1.25,
  },

  mainTakeaway: {
    px: 2,
    py: 0.5,
    mb: 2.25,
    borderRadius: 'md',
    bgcolor: '#f9fafb',
    border: '1px solid',
    borderColor: '#e5e7eb',
  },
}
