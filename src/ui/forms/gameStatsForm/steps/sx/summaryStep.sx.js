// src/ui/forms/gameStatsForm/steps/sx/summaryStep.sx.js

export const summaryStepSx = {
  stepContent: {
    display: 'grid',
    gap: 1,
    width: '100%',
  },

  summaryStatsCard: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    p: 1,
    borderRadius: 'md',
  },

  summaryList: {
    display: 'grid',
    gap: 0.5,
    p: 0.75,
    borderRadius: 'md',
  },

  summaryPlayerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  summaryPlayerRow: row => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    p: 0.85,
    borderRadius: 'md',
    cursor: 'pointer',
    border: '1px solid',
    borderColor: row.isComplete
      ? 'success.200'
      : row.isPartial
        ? 'warning.200'
        : 'divider',
    bgcolor: row.isComplete
      ? 'success.50'
      : row.isPartial
        ? 'warning.50'
        : 'background.surface',

    '&:hover': {
      bgcolor: row.isComplete
        ? 'success.100'
        : row.isPartial
          ? 'warning.100'
          : 'background.level1',
    },
  }),

  summaryRowRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },
}
