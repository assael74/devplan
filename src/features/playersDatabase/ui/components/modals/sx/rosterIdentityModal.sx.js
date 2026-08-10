// src/features/playersDatabase/ui/components/modals/sx/rosterIdentityModal.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const rosterIdentityModalSx = {
  modalContent: {
    p: 1,
  },

  content: {
    minWidth: 0,
    display: 'grid',
    gap: 1.5,
  },

  section: {
    minWidth: 0,
    display: 'grid',
    gap: 1,
  },

  sectionTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  incomingCard: {
    display: 'grid',
    gap: 0.75,
  },

  playerName: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  playerLink: {
    width: 'fit-content',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
    cursor: 'pointer',

    '&:hover': {
      color: devPlanColors.primary,
    },
  },

  metaGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr 1fr',
      md: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  metaItem: {
    minWidth: 0,
    p: 0.75,
    borderRadius: 8,
    bgcolor: 'background.level1',
  },

  metaLabel: {
    color: 'neutral.500',
  },

  metaValue: {
    color: devPlanColors.primaryDark,
    fontWeight: 600,
  },

  candidatesGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1,
  },

  candidateCard: {
    display: 'grid',
    gap: 0.75,
  },

  candidateCardSelected: {
    borderColor: 'primary.400',
  },

  candidateHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  candidateMeta: {
    color: 'neutral.600',
  },

  matchChips: {
    flexWrap: 'wrap',
  },

  historyWrap: {
    maxHeight: 260,
    overflow: 'auto',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
  },

  historyTable: {
    minWidth: 720,

    '& th': {
      textAlign: 'right',
      whiteSpace: 'nowrap',
      fontWeight: 700,
    },

    '& td': {
      textAlign: 'right',
      whiteSpace: 'nowrap',
    },
  },

  emptyText: {
    color: 'neutral.500',
  },

  decisionCard: {
    display: 'grid',
    gap: 1,
  },

  decisionHelp: {
    color: 'neutral.600',
  },

  decisionActions: {
    alignItems: {
      xs: 'stretch',
      md: 'center',
    },
  },

  pendingHelp: {
    color: 'warning.700',
  },
}
