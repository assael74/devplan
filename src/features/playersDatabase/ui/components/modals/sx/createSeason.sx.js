// features/playersDatabase/ui/components/modals/sx/createSeason.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const createSeasonSx = {
  root: {
    minWidth: 0,
    gap: 1.5,
  },

  leagueContext: {
    minWidth: 0,
    p: 1.25,
    display: 'grid',
    gap: 0.25,
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    bgcolor: '#f7faff',
  },

  contextLabel: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  contextTitle: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  contextMeta: {
    color: devPlanColors.secondary,
  },

  formGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1.25,
  },

  fullRow: {
    gridColumn: {
      md: '1 / -1',
    },
  },

  label: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  control: {
    minHeight: 38,
    borderRadius: 8,
  },

  note: {
    p: 1,
    borderRadius: 8,
    bgcolor: '#fff8e8',
    border: '1px solid #f1d8a4',
  },

  noteText: {
    color: '#8a5a00',
  },
}
