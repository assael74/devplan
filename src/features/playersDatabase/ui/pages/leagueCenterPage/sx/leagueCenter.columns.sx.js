// src/features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenter.columns.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterColumnsSx = {
  leagueLink: {
    color: 'inherit',
    textDecoration: 'none',

    '&:hover': {
      color: devPlanColors.tertiaryDark,
      textDecoration: 'underline',
    },
  },

  factsChips: {
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',

    '& .MuiChip-root': {
      '--Chip-radius': 'var(--joy-radius-sm)',
      '--Chip-gap': '0.4rem',
      '--Chip-minHeight': '26px',
      minWidth: 48,
      px: 0.7,
      fontWeight: 700,
    },
  },

  priorityFacts: {
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',

    '& .MuiChip-root': {
      '--Chip-radius': 'var(--joy-radius-sm)',
      '--Chip-gap': '0.35rem',
      '--Chip-minHeight': '26px',
      minWidth: 44,
      px: 0.6,
      fontWeight: 700,
    },
  },

  dateFact: {
    color: devPlanColors.secondary,
    whiteSpace: 'nowrap',
  },

  statusChip: {
    '--Chip-radius': 'var(--joy-radius-sm)',
    fontWeight: 700,
  },

  birthYearHeader: {
    textAlign: 'center !important',
  },

  leagueNameHeader: {
    pr: 1.5,
  },

  leagueNameCell: {
    pr: 1.5,
  },

  createSeasonButton: {
    color: devPlanColors.primary,
    borderColor: devPlanColors.primaryLight,
    bgcolor: '#fff',
  },

  openLeagueButton: {
    color: devPlanColors.primary,
    bgcolor: devPlanColors.primaryLight,
    fontWeight: 700,

    '&:hover': {
      bgcolor: devPlanColors.tertiaryLight,
      color: devPlanColors.tertiary,
    },
  },
}
