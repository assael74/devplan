// src/features/playersDatabase/ui/pages/teamPage/yearDevelopment/sx/teamYearMovementsSection.sx.js
import { COLORS, devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

const statusColors = COLORS.status
// Investigation table only; these widths sum to 100%.
export const MOVEMENT_TABLE_COLUMN_WIDTHS = Object.freeze({
  index: 3,
  avatar: 3,
  name: 12,
  favorite: 3,
  gamesStarts: 6,
  minutes: 9,
  substitutedOut: 8,
  goals: 9,
  lineClassification: 8,
  scoutProfile: 15,
  transition: 20,
  openPlayer: 4,
})

const resolveMovementTagTone = color => {
  if (color === 'success') {
    return {
      borderColor: statusColors.success.solid,
      bgcolor: statusColors.success.softBg,
      color: statusColors.success.text,
    }
  }

  if (color === 'warning') {
    return {
      borderColor: statusColors.warning.solid,
      bgcolor: statusColors.warning.softBg,
      color: statusColors.warning.text,
    }
  }

  if (color === 'primary') {
    return {
      borderColor: devPlanColors.tertiary,
      bgcolor: devPlanColors.tertiaryLight,
      color: devPlanColors.tertiaryDark,
    }
  }

  return {
    borderColor: devPlanColors.border,
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.secondary,
  }
}

export const teamYearMovementsSectionSx = {
  emptyInline: {
    color: devPlanColors.secondary,
    fontSize: 12,
    py: 1,
  },

  movementSeasonContent: {
    display: 'grid',
    gap: 1,
    minWidth: 0,
  },

  movementHeaderSummary: {
    flexShrink: 1,
    minWidth: 0,
    justifyContent: 'flex-end',
    '& > div': {
      justifyContent: 'flex-end',
    },
  },

  movementToolbarTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },

  movementToolbarFloating: {
    top: '100%',
    borderTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },

  movementInsights: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.75,
    px: 1,
    py: 0.7,
    borderRadius: 7,
    bgcolor: devPlanColors.primaryLight,
    minWidth: 0,
  },

  movementInsightsTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 900,
  },

  movementInsightsUnavailable: {
    color: devPlanColors.secondary,
    fontSize: 11,
  },

  movementSignalStatus: status => {
    const tone = status === 'multiple'
      ? statusColors.warning
      : status === 'single' ? statusColors.info : statusColors.neutral

    return {
      px: 0.6,
      py: 0.2,
      border: `1px solid ${tone.solid}`,
      borderRadius: 99,
      bgcolor: tone.softBg,
      color: tone.text,
      fontSize: 10.5,
      fontWeight: 800,
      whiteSpace: 'nowrap',
    }
  },

  movementInsightItem: active => ({
    color: active ? statusColors.warning.text : devPlanColors.secondary,
    fontSize: 11,
    fontWeight: active ? 800 : 600,
  }),

  movementPeriodControls: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.75,
    minWidth: 0,
    marginInlineStart: 'auto',
  },

  movementPeriodLabel: {
    color: devPlanColors.secondary,
    fontSize: 11,
    fontWeight: 700,
  },

  movementPeriodOption: active => ({
    color: active ? devPlanColors.primaryDark : devPlanColors.secondary,
    fontSize: 11,
    fontWeight: active ? 800 : 600,
    whiteSpace: 'nowrap',
  }),

  movementTableScroll: {
    minWidth: 0,
    overflowX: 'auto',
  },

  movementTableWrap: {
    height: 'auto',
    minWidth: { xs: 1100, xl: 0 },
  },

  movementTableBody: {
    overflowY: 'auto',
  },

  movementRow: side => ({
    '& > td': {
      bgcolor: side === 'out' ? statusColors.warning.softBg : statusColors.success.softBg,
    },
  }),

  movementTable: {
    minWidth: { xs: 1100, xl: 0 },
    tableLayout: 'fixed',
    '& th[data-column="name"], & td[data-column="name"], & th[data-column="transition"], & td[data-column="transition"]': {
      textAlign: 'left',
    },
    '& th[data-column="index"], & td[data-column="index"], & th[data-column="avatar"], & td[data-column="avatar"], & th[data-column="favorite"], & td[data-column="favorite"], & th[data-column="openPlayer"], & td[data-column="openPlayer"]': {
      px: 0.25,
    },
  },

  movementGroups: {
    display: 'grid',
    gap: 2,
    '& > div + div': {
      pt: 1.5,
      borderTop: `2px solid ${devPlanColors.border}`,
    },
  },

  movementGroup: {
    display: 'grid',
    gap: 0.4,
    minWidth: 0,
  },

  movementGroupHeader: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 1,
    minWidth: 0,
  },

  movementGroupTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 13,
    fontWeight: 900,
  },

  movementHeaderLabel: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
  },

  movementDetail: {
    color: devPlanColors.secondary,
    fontSize: 11,
  },

  movementPreviousLine: {
    display: 'flex',
    justifyContent: 'center',
    '& .MuiChip-root': {
      transform: 'scale(0.85)',
      transformOrigin: 'center',
    },
  },

  movementPreviousProfile: {
    transform: 'scale(0.8)',
    transformOrigin: 'center',
  },

  movementTeam: {
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 700,
  },

  movementTransition: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 0.5,
    minWidth: 0,
  },

  movementSeasons: {
    display: 'grid',
    gap: 3,
    '& > div': {
      borderTop: `3px solid ${devPlanColors.primary}`,
    },
  },

  movementTag: color => {
    const tone = resolveMovementTagTone(color)

    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.35,
      px: 0.65,
      py: 0.3,
      borderRadius: 99,
      border: `1px solid ${tone.borderColor}`,
      bgcolor: tone.bgcolor,
      color: tone.color,
      fontSize: 10.5,
      fontWeight: 800,
      '& svg': {
        fontSize: 13,
      },
    }
  },

  movementTagText: {
    color: 'inherit',
    fontSize: 10.5,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
}
