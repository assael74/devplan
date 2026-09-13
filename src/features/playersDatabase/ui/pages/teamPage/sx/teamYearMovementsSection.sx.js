import { COLORS, devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const statusColors = COLORS.status

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
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'minmax(0, 1.2fr) minmax(120px, .8fr) minmax(150px, 1fr)',
    },
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
  },

  movementProfile: {
    color: devPlanColors.secondary,
    fontSize: 11,
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
