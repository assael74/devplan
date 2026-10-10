// src/features/playersDatabase/ui/pages/teamPage/stats/clear/sx/clearStatsModal.sx.js

export const clearStatsModalSx = {
  body: {
    display: 'grid',
    gap: 2,
  },

  syncPanel: {
    display: 'grid',
    gap: 1.25,
  },

  executingNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    p: 1.25,
    borderRadius: 'md',
    bgcolor: 'primary.softBg',
  },

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

  executionGroup: {
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    overflow: 'hidden',
  },

  executionGroupSummary: {
    cursor: 'pointer',
    p: 1.25,
    listStyle: 'none',
    '&::-webkit-details-marker': { display: 'none' },
  },

  executionItemsGroup: {
    display: 'grid',
    gap: 0.5,
    px: 1,
    pb: 1,
  },

  executionItem: {
    borderRadius: 'sm',
    bgcolor: 'background.level1',
  },

  executionItemSummaryButton: {
    cursor: 'pointer',
    p: 1,
    listStyle: 'none',
    '&::-webkit-details-marker': { display: 'none' },
  },

  executionItemSummary: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  executionItemDetails: {
    display: 'grid',
    gap: 0.5,
    px: 1,
    pb: 1,
    color: 'text.secondary',
  },

  actions: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 1,
  },
}
