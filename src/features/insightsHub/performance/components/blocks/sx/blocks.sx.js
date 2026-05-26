// features/insightsHub/performance/components/blocks/sx/blocks.sx.js

export const blocksSx = {
  body: {
    minHeight: 0,
    display: 'grid',
    gap: 1.5,
    pb: { xs: 12, md: 4 },
  },

  intro: {
    color: 'text.secondary',
    lineHeight: 1.8,
  },

  caseGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1.25,
  },

  caseCard: {
    minWidth: 0,
    display: 'grid',
    gap: 0.75,
    borderRadius: 18,
    p: 1.5,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
  },

  formulaCard: {
    minWidth: 0,
    display: 'grid',
    gap: 0.75,
    borderRadius: 18,
    p: 1.5,
    bgcolor: 'background.level2',
    border: '1px solid',
    borderColor: 'divider',
  },

  formulaText: {
    minWidth: 0,
    overflowX: 'auto',
    direction: 'ltr',
    textAlign: 'left',
    fontWeight: 700,
    fontFamily: 'monospace',
    bgcolor: 'background.level1',
    borderRadius: 12,
    px: 1,
    py: 0.75,
  },

  list: {
    display: 'grid',
    gap: 0.75,
    m: 0,
    p: 0,
    listStyle: 'none',
  },

  listItem: {
    borderRadius: 14,
    p: 1,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    color: 'text.secondary',
    lineHeight: 1.7,
  },

  tableWrap: {
    minWidth: 0,
    maxWidth: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
    borderRadius: 16,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
  },

  tableHead: templateColumns => ({
    minWidth: 'fit-content',
    display: 'grid',
    gridTemplateColumns: templateColumns,
    gap: 1,
    px: 1.25,
    py: 1,
    bgcolor: 'background.level2',
    borderBottom: '1px solid',
    borderColor: 'divider',

    '& *': {
      fontWeight: 700,
      color: 'text.tertiary',
    },
  }),

  tableRow: templateColumns => ({
    minWidth: 'fit-content',
    display: 'grid',
    gridTemplateColumns: templateColumns,
    gap: 1,
    px: 1.25,
    py: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',

    '&:last-child': {
      borderBottom: 0,
    },
  }),
}
