import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamYearDevelopmentSharedSx = {
  evolutionCollapse: {
    overflow: 'hidden',
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 7,
    bgcolor: devPlanColors.primaryLight,
  },

  evolutionCollapseBody: {
    display: 'grid',
    gap: 0.55,
    p: 0.75,
  },

  evolutionCollapseContent: {
    borderTop: `1px solid ${devPlanColors.border}`,
  },

  evolutionCollapseEmptySummary: {
    px: 0.65,
    py: 0.25,
    borderRadius: 5,
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.secondary,
    fontSize: 10.5,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  evolutionCollapseFacts: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    flexWrap: 'wrap',
    color: devPlanColors.secondary,
  },

  evolutionCollapseHeader: {
    px: 0.75,
    py: 0.7,
    bgcolor: devPlanColors.primaryLight,
    '&:hover': {
      bgcolor: '#DCE8F0',
    },
  },

  evolutionCollapseSeason: {
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },

  evolutionCollapseSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.15,
    minWidth: 0,
    flexWrap: 'nowrap',
  },

  evolutionGroup: {
    display: 'grid',
    gap: 0.65,
    minWidth: 0,
  },

  evolutionRows: {
    display: 'grid',
    gap: 0.4,
  },

  evolutionSummaryChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.25,
    minHeight: 22,
    px: 0.4,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 99,
    bgcolor: devPlanColors.surface,
    color: devPlanColors.primaryDark,
    whiteSpace: 'nowrap',
    '& > svg': {
      flexShrink: 0,
      color: devPlanColors.tertiaryDark,
      fontSize: 14,
    },
    '& > p': {
      color: 'inherit',
      fontSize: 10.5,
      fontWeight: 800,
    },
  },

  evolutionSummarySeparator: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    color: '#111827',
    fontSize: 12,
    fontWeight: 900,
    lineHeight: 1,
  },

  evolutionSummaryValue: {
    display: 'grid',
    placeItems: 'center',
    minWidth: 17,
    minHeight: 17,
    px: 0.25,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 99,
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.primaryDark,
    '& p': {
      color: 'inherit',
      fontSize: 10.5,
      fontWeight: 900,
      lineHeight: 1,
    },
  },

  seasonSummaryChip: {
    maxWidth: '100%',
    px: 0.6,
    py: 0.15,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 99,
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.primaryDark,
  },

  seasonSummary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
    minWidth: 0,
    whiteSpace: 'nowrap',
  },

  seasonSummaryChipAgeGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'center',
    color: devPlanColors.secondary,
    fontSize: 10,
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },

  seasonSummaryChipContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.4,
    minWidth: 0,
    whiteSpace: 'nowrap',
  },

  seasonSummaryChipLevel: {
    fontSize: 9,
  },

  seasonSummaryChipLeague: {
    gap: 0,
  },

  seasonSummaryChipSeparator: {
    color: devPlanColors.secondary,
    fontSize: 11,
    fontWeight: 900,
  },

  seasonSummaryChipText: {
    color: devPlanColors.primaryDark,
    fontSize: 10.5,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    mb: 2,
  },

  section: {
    p: {
      xs: 1,
      md: 1.15,
    },
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 10,
    bgcolor: devPlanColors.surface,
    minWidth: 0,
  },

  title: {
    color: devPlanColors.primaryDark,
    fontSize: 15,
    fontWeight: 800,
  },

  titleContainer: {
    width: '100%',
    minWidth: 0,
  },

  titleExtra: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },

  titleIcon: {
    display: 'grid',
    placeItems: 'center',
    width: 23,
    height: 23,
    borderRadius: 7,
    border: `1px solid ${devPlanColors.primaryDark}`,
    bgcolor: devPlanColors.primary,
    color: devPlanColors.surface,
    '& svg': {
      color: `${devPlanColors.surface} !important`,
      fontSize: 14,
    },
  },

  titleIdentity: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    minWidth: 0,
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    width: '100%',
  },
}
