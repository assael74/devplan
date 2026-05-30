// src/ui/forms/gameStatsForm/steps/sx/summaryStep.sx.js

const fieldTypeBg = {
  attack: 'success.50',
  offense: 'success.50',
  attacking: 'success.50',

  defense: 'danger.50',
  defending: 'danger.50',

  possession: 'primary.50',
  passing: 'primary.50',

  general: 'background.level1',
}

const fieldTypeBorder = {
  attack: 'success.200',
  offense: 'success.200',
  attacking: 'success.200',

  defense: 'danger.200',
  defending: 'danger.200',

  possession: 'primary.200',
  passing: 'primary.200',

  general: 'divider',
}

export const summaryStepSx = {
  stepContent: {
    display: 'grid',
    gap: 1,
    width: '100%',
    minWidth: 0,
  },

  summaryStatsCard: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    p: 1,
    borderRadius: 'md',
  },

  summaryDetailedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
    p: 0.75,
    borderRadius: 'md',
    minWidth: 0,
    overflow: 'auto',
  },

  summaryDetailedRow: ({ locked, row } = {}) => ({
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: '220px 86px minmax(0, 1fr)',
    },
    gap: 1,
    alignItems: 'center',
    p: 0.75,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: row?.isComplete
      ? 'success.200'
      : row?.isPartial
        ? 'warning.200'
        : 'divider',
    bgcolor: locked
      ? 'background.level1'
      : row?.isComplete
        ? 'success.50'
        : row?.isPartial
          ? 'warning.50'
          : 'background.surface',
    cursor: locked ? 'default' : 'pointer',
    opacity: locked ? 0.82 : 1,
    minWidth: 0,
    overflow: 'hidden',
    transition: 'background-color .15s ease, border-color .15s ease',

    '&:hover': {
      bgcolor: locked
        ? 'background.level1'
        : row?.isComplete
          ? 'success.100'
          : row?.isPartial
            ? 'warning.100'
            : 'background.level1',
    },
  }),

  summaryPlayerInfo: {
    minWidth: 0,
    width: 220,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  summaryStatusCell: {
    width: 86,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.4,
    flexWrap: 'wrap',
  },

  summaryFieldsGrid: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    overflowX: 'auto',
    overflowY: 'hidden',
    pb: 0.25,
    scrollbarWidth: 'thin',
  },

  summaryFieldCell: (type = 'general', empty = false) => ({
    flex: '0 0 auto',
    minWidth: 72,
    maxWidth: 112,
    px: 1,
    py: 0.45,
    borderRadius: 'sm',
    bgcolor: fieldTypeBg[type] || 'background.level1',
    border: '1px solid',
    borderColor: fieldTypeBorder[type] || 'divider',
    opacity: empty ? 0.62 : 1,
  }),

  summaryFieldLabel: {
    display: 'block',
    color: 'text.tertiary',
    lineHeight: 1.15,
    fontSize: 10.5,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  summaryFieldValue: {
    display: 'block',
    fontWeight: 700,
    lineHeight: 1.25,
    fontSize: 12,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // legacy keys — להשאיר כדי לא לשבור שימוש ישן אם נשאר איפשהו
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
    cursor: row?.locked || row?.disabled ? 'default' : 'pointer',
    border: '1px solid',
    borderColor: row?.isComplete
      ? 'success.200'
      : row?.isPartial
        ? 'warning.200'
        : 'divider',
    bgcolor: row?.locked || row?.disabled
      ? 'background.level1'
      : row?.isComplete
        ? 'success.50'
        : row?.isPartial
          ? 'warning.50'
          : 'background.surface',

    '&:hover': {
      bgcolor: row?.locked || row?.disabled
        ? 'background.level1'
        : row?.isComplete
          ? 'success.100'
          : row?.isPartial
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
