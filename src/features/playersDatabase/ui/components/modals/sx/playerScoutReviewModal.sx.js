// src/features/playersDatabase/ui/components/modals/sx/playerScoutReviewModal.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerScoutReviewModalSx = {
  modalContent: {
    maxHeight: '72vh',
    overflowY: 'auto',
  },

  content: {
    display: 'grid',
    gap: 1.25,
  },

  section: {
    display: 'grid',
    gap: 0.9,
    p: 1.1,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 8,
  },

  immediacySection: {
    backgroundColor: devPlanColors.primaryLight,
  },

  sectionTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  twoColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 1,
  },

  field: {
    minWidth: 0,
    display: 'grid',
    gap: 0.45,
  },

  label: {
    color: devPlanColors.primaryDark,
    fontWeight: 600,
  },

  observationField: {
    display: 'grid',
    gap: 0.5,
  },

  observationHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  statusSelect: {
    minWidth: 104,
  },

  textarea: {
    borderRadius: 7,
  },

  helperText: {
    color: devPlanColors.tertiaryDark,
  },
}
