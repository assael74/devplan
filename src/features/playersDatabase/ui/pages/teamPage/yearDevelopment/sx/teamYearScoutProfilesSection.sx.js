// src/features/playersDatabase/ui/pages/teamPage/yearDevelopment/sx/teamYearScoutProfilesSection.sx.js
import { COLORS, devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const teamYearScoutProfilesSectionSx = {
  profileInsightSlot: {
    flex: '1 1 auto',
    minWidth: 0,
    maxWidth: 820,
  },

  profileInsightNotes: count => ({
    display: 'grid',
    gridTemplateColumns: count > 1 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
    gap: 0.75,
    minWidth: 0,
    width: '100%',
  }),

  profileInsightNoteSlot: divided => ({
    minWidth: 0,
    ...(divided ? {
      borderInlineStart: `1px solid ${devPlanColors.border}`,
      paddingInlineStart: 0.75,
    } : {}),
  }),

  profileInsightNote: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
    px: 0.6,
    py: 0.35,
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 400,
    lineHeight: 1.35,
  },

  profileInsightEmphasis: {
    color: 'inherit',
    fontWeight: 800,
  },

  profileInsightNoteTone: tone => {
    const colors = tone === 'positive' ? COLORS.status.success
      : tone === 'negative' ? COLORS.status.warning : COLORS.status.neutral
    return { bgcolor: colors.softBg, color: colors.text }
  },

  profileGroups: {
    display: 'grid',
    gap: 0.7,
  },

  profileGroup: {
    display: 'grid',
    gap: 0.4,
    minWidth: 0,
    '& + &': {
      borderTop: `1px solid ${devPlanColors.border}`,
      pt: 0.7,
    },
  },

  profileGroupHeading: {
    px: 0.6,
    py: 0.25,
    borderRadius: 5,
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 800,
  },

  profileGroupEmpty: {
    color: devPlanColors.secondary,
    fontSize: 10.5,
  },

  profileDistributionCount: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    justifySelf: 'center',
    minWidth: 22,
    height: 20,
    px: 0.35,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 99,
    bgcolor: devPlanColors.surface,
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 900,
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
    gridTemplateColumns: '140px minmax(0, 1fr) 24px',
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
