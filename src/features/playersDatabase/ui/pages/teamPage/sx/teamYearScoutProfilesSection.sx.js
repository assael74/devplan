import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamYearScoutProfilesSectionSx = {
  profileDistributionCount: {
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 900,
    textAlign: 'center',
  },

  profileDistributionFill: width => ({
    width: `${width}%`,
    minWidth: width ? 4 : 0,
    height: '100%',
    borderRadius: 99,
    bgcolor: devPlanColors.tertiary,
  }),

  profileDistributionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.4,
    minWidth: 0,
    color: devPlanColors.primaryDark,
    '& svg': {
      flexShrink: 0,
      color: devPlanColors.tertiaryDark,
      fontSize: 14,
    },
    '& p': {
      overflow: 'hidden',
      fontSize: 11,
      fontWeight: 800,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  profileDistributionList: {
    display: 'grid',
    gap: 0.45,
  },

  profileDistributionRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(110px, .9fr) minmax(80px, 1.4fr) 24px',
    alignItems: 'center',
    gap: 0.65,
    minWidth: 0,
  },

  profileDistributionTrack: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 99,
    bgcolor: devPlanColors.primaryLight,
  },
}
