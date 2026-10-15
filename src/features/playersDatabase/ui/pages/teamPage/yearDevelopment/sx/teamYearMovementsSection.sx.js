// src/features/playersDatabase/ui/pages/teamPage/yearDevelopment/sx/teamYearMovementsSection.sx.js
import { COLORS, devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

const statusColors = COLORS.status
const movementColumns = {
  xs: 'repeat(2, minmax(0, 1fr))',
  md: 'minmax(150px, 1.2fr) minmax(80px, .6fr) minmax(130px, 1fr) minmax(180px, 1.2fr) minmax(100px, .7fr)',
}

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

  movementAvatar: {
    width: 24,
    height: 24,
    flexShrink: 0,
    fontSize: 10,
    bgcolor: devPlanColors.primaryLight,
  },

  movementCollapse: {
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 8,
    overflow: 'hidden',
    bgcolor: devPlanColors.primaryLight,
  },

  movementCollapseBody: {
    p: 0.75,
    borderTop: `1px solid ${devPlanColors.border}`,
  },

  movementCollapseHeader: {
    px: 1,
    py: 0.55,
    bgcolor: devPlanColors.primaryLight,
    '&:hover': {
      bgcolor: '#DCE8F0',
    },
  },

  movementItem: {
    display: 'grid',
    gridTemplateColumns: movementColumns,
    alignItems: 'center',
    gap: 1,
    p: 0.75,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 8,
    bgcolor: devPlanColors.surface,
  },

  movementList: {
    display: 'grid',
    gap: 0.75,
  },

  movementGroups: {
    display: 'grid',
    gap: 1.5,
  },

  movementGroup: {
    display: 'grid',
    gap: 0.5,
  },

  movementGroupTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 900,
  },

  movementTableHeader: {
    display: { xs: 'none', md: 'grid' },
    gridTemplateColumns: movementColumns,
    gap: 1,
    px: 0.75,
    color: devPlanColors.secondary,
  },

  movementMobileSort: {
    display: { xs: 'flex', md: 'none' },
    gap: 0.5,
    overflowX: 'auto',
    pb: 0.25,
  },

  movementSortButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.4,
    border: 0,
    borderRadius: 4,
    px: 0.4,
    py: 0.3,
    bgcolor: 'transparent',
    color: devPlanColors.secondary,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 10,
    fontWeight: 800,
    whiteSpace: 'nowrap',
    '&:hover': { bgcolor: devPlanColors.primaryLight },
    '&:focus-visible': { outline: `2px solid ${devPlanColors.primary}` },
  },

  movementSortButtonActive: {
    color: devPlanColors.primaryDark,
    bgcolor: devPlanColors.primaryLight,
  },

  movementSortIcon: {
    fontSize: 14,
    flexShrink: 0,
  },

  movementCell: {
    display: 'grid',
    gap: 0.2,
    minWidth: 0,
  },

  movementMobileLabel: {
    display: { xs: 'block', md: 'none' },
    color: devPlanColors.secondary,
    fontSize: 10,
  },

  movementDetail: {
    color: devPlanColors.secondary,
    fontSize: 11,
  },

  movementTeam: {
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 700,
  },

  movementName: {
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 900,
  },

  movementPlayer: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
    gridColumn: { xs: '1 / -1', md: 'auto' },
  },

  movementSeasons: {
    display: 'grid',
    gap: 0.35,
  },

  movementTag: color => {
    const tone = resolveMovementTagTone(color)

    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.35,
      justifySelf: 'start',
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
