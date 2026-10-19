// src/features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenter.columns.sx.js

import { COLORS, devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterColumnsSx = {
  loadingAreaCell: { bgcolor: devPlanColors.tertiaryLight },

  loadingAreaHeader: { '&&': { bgcolor: devPlanColors.primaryLight } },

  workAreaCell: { bgcolor: COLORS.status.success.softBg },

  workAreaHeader: { '&&': { bgcolor: 'success.100' } },

  missingFact: {
    display: 'inline-flex',
    color: 'text.secondary',
    alignItems: 'center',
  },

  signalStrengthBadge: pending => {
    const colors = pending ? COLORS.status.info : COLORS.status.warning
    return {
      '--Chip-radius': '6px',
      minHeight: 24,
      minWidth: 48,
      px: 0.7,
      fontSize: 11,
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
      border: '1px solid',
      borderColor: colors.solid,
      bgcolor: colors.softBg,
      color: colors.text,
      cursor: 'pointer',

      '&:hover': {
        boxShadow: `inset 0 0 0 1px ${colors.solid}`,
      },

      '&:focus-within': {
        outline: `2px solid ${colors.solid}`,
        outlineOffset: 2,
      },
    }
  },

  investigationBadge: marked => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.4,
    minWidth: 36,
    height: 24,
    px: 0.5,
    boxSizing: 'border-box',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: marked ? 'success.200' : 'neutral.300',
    color: marked ? 'success.600' : 'neutral.500',
    bgcolor: marked ? 'success.50' : 'neutral.50',
    fontSize: 11,
    fontWeight: 600,
  }),

  coverageChip: {
    '--Chip-radius': '6px',
    fontSize: 11,
    fontWeight: 600,
  },

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
