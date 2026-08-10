// src/features/playersDatabase/ui/components/modals/sx/playerScoutAudit.sx.js

export const playerScoutAuditSx = {
  modalContent: {
    p: 1,
  },

  content: {
    minWidth: 0,
    display: 'grid',
    gap: 1.5,
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(6, minmax(0, 1fr))',
    },
    gap: 1,
  },

  summaryCard: {
    minWidth: 0,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
  },

  summaryTone: {
    neutral: {
      bgcolor: 'background.level1',
    },
    success: {
      bgcolor: 'success.softBg',
      borderColor: 'success.softColor',
    },
    warning: {
      bgcolor: 'warning.softBg',
      borderColor: 'warning.softColor',
    },
    danger: {
      bgcolor: 'danger.softBg',
      borderColor: 'danger.softColor',
    },
  },

  summaryLabel: {
    color: 'neutral.600',
  },

  summaryValue: {
    mt: 0.25,
    fontWeight: 700,
  },

  profileCountsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1,
  },

  profileCounts: {
    minWidth: 0,
    display: 'grid',
    gap: 0.75,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
  },

  profileChips: {
    flexWrap: 'wrap',
  },

  sectionTitle: {
    fontWeight: 700,
  },

  emptyText: {
    color: 'neutral.500',
  },

  successBox: {
    p: 1.25,
    borderRadius: 8,
    bgcolor: 'success.softBg',
    color: 'success.softColor',
  },

  successTitle: {
    mb: 0.25,
    fontWeight: 700,
  },


  repairBox: {
    display: 'grid',
    gap: 1,
    p: 1.25,
    border: '1px solid',
    borderColor: 'warning.300',
    borderRadius: 8,
    bgcolor: 'warning.softBg',
  },

  repairHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  repairGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(5, minmax(0, 1fr))',
    },
    gap: 1,
  },

  repairNote: {
    color: 'warning.700',
  },

  repairResultBox: {
    display: 'grid',
    gap: 0.5,
    p: 1.25,
    border: '1px solid',
    borderColor: 'success.300',
    borderRadius: 8,
    bgcolor: 'success.softBg',
  },

  issuesSection: {
    minWidth: 0,
    display: 'grid',
    gap: 0.75,
  },

  issuesHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  issueCount: {
    color: 'neutral.500',
  },

  tableWrap: {
    maxHeight: 440,
    overflow: 'auto',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
  },

  table: {
    minWidth: 980,

    '& th': {
      textAlign: 'right',
      whiteSpace: 'nowrap',
      fontWeight: 700,
    },

    '& td': {
      textAlign: 'right',
      verticalAlign: 'top',
    },
  },
}
