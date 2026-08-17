// src/features/playersDatabase/ui/pages/playerPage/sx/playerNarrativeCard.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerNarrativeCardSx = {
  card: {
    minWidth: 0,
    px: 1.1,
    py: 0.95,
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 1fr)',
    gap: 0.9,
    borderRadius: 10,
    border: `1px solid ${devPlanColors.border}`,
    bgcolor: '#fff',
  },

  emptyCard: {
    bgcolor: '#fbfdff',
  },

  approvedCard: {
    bgcolor: '#f7fbff',
    borderColor: '#cfe3f1',
  },

  updateAvailableCard: {
    bgcolor: '#fffaf2',
    borderColor: '#E8D6AE',
  },

  iconWrap: {
    width: 36,
    height: 36,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 10,
    bgcolor: devPlanColors.tertiaryLight,
    color: devPlanColors.tertiaryDark,
    flexShrink: 0,
  },

  main: {
    minWidth: 0,
  },

  headingRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  eyebrow: {
    color: devPlanColors.tertiaryDark,
    fontWeight: 700,
  },

  statusChip: {
    flexShrink: 0,
    fontWeight: 700,
  },

  title: {
    mt: 0.25,
    color: devPlanColors.primaryDark,
    fontSize: {
      xs: 20,
      md: 23,
    },
    lineHeight: 1.25,
    fontWeight: 700,
  },

  summary: {
    mt: 0.4,
    maxWidth: 980,
    color: '#38586f',
    lineHeight: 1.5,
  },

  footer: {
    mt: 0.65,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
  },

  metaRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },

  metaText: {
    color: devPlanColors.secondary,
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.7,
    flexWrap: 'wrap',
  },
}
