export const deleteModalPresentationSx = {
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 1,
  },
  summaryItem: {
    p: 1.25,
    borderRadius: 'sm',
    bgcolor: 'background.level1',
  },
  details: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'md',
    overflow: 'hidden',
  },
  ids: {
    borderTop: '1px solid',
    borderColor: 'divider',
    mt: 1,
    pt: 0.5,
  },
  detailsSummary: {
    cursor: 'pointer',
    p: 1.1,
    listStyle: 'none',
    fontWeight: 600,
    '&::-webkit-details-marker': { display: 'none' },
  },
  detailsBody: {
    display: 'grid',
    gap: 0.75,
    px: 1.1,
    pb: 1.1,
  },
  idsBody: {
    display: 'grid',
    gap: 0.5,
    px: 1.1,
    pb: 1.1,
    overflowWrap: 'anywhere',
  },
  progressRow: {
    display: 'grid',
    gap: 0.25,
    p: 1,
    borderRadius: 'sm',
    bgcolor: 'background.level1',
  },
}
