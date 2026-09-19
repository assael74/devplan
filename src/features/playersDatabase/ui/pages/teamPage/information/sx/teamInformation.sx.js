import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const teamInformationSx = {
  content: {
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    pr: 0.25,
    display: 'grid',
    alignContent: 'start',
    gap: 1.25,
  },

  performanceAnchor: {
    scrollMarginTop: 52,
  },

  performanceContextBar: {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: {
      xs: 0.9,
      sm: 1.25,
    },
    py: 0.6,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 9,
    bgcolor: devPlanColors.surface,
    boxShadow: '0 6px 16px rgba(17, 58, 90, 0.12)',
  },

  performanceContextContent: {
    display: 'flex',
    alignItems: 'center',
    gap: {
      xs: 0.7,
      sm: 1.25,
    },
    minWidth: 0,
  },

  performanceContextTitle: {
    flexShrink: 0,
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 800,
  },

  performanceContextItems: {
    display: 'flex',
    alignItems: 'center',
    gap: {
      xs: 0.5,
      sm: 0.9,
    },
    minWidth: 0,
  },

  performanceContextItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
    minWidth: 0,
    whiteSpace: 'nowrap',
  },

  performanceContextIcon: {
    display: 'grid',
    placeItems: 'center',
    color: devPlanColors.secondary,
    '& svg': {
      fontSize: 13,
    },
  },

  performanceContextLabel: {
    color: devPlanColors.secondary,
    fontSize: 10,
    fontWeight: 700,
  },

  performanceContextValue: {
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 800,
  },

  performanceContextAction: {
    flexShrink: 0,
    minHeight: 24,
    px: 0.5,
    color: devPlanColors.primaryDark,
    fontSize: 10,
    fontWeight: 800,
  },

  section: {
    p: {
      xs: 1.25,
      md: 1.5,
    },
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 10,
    bgcolor: devPlanColors.surface,
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    pt: 0,
    pr: 0,
    mb: 2,
  },

  sectionTitleRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.65,
    minWidth: 0,
    flexWrap: 'nowrap',
  },

  sectionTitleIcon: {
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

  sectionTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 15,
    fontWeight: 800,
  },

  rosterSeasonChips: {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: 0.35,
  },

  rosterSeasonChip: {
    minHeight: 20,
    px: 0.6,
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    color: devPlanColors.secondary,
    bgcolor: '#fff',
    border: `1px solid ${devPlanColors.border}`,
    cursor: 'pointer',
    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },

  rosterSeasonChipSelected: {
    color: devPlanColors.primary,
    bgcolor: '#fff',
    borderColor: devPlanColors.primary,
    boxShadow: 'none',
  },

  rosterSeasonChipStatic: {
    cursor: 'default',
  },

  rosterSeasonChipContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.3,
    minWidth: 0,
  },

  rosterSeasonChipText: {
    color: 'inherit',
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  rosterSeasonChipSeparator: {
    color: 'inherit',
    fontSize: 10,
    fontWeight: 700,
  },

  rosterSeasonLeagueLevel: {
    px: 0.3,
    py: 0.05,
    borderRadius: 99,
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
  },

  sectionExportButton: {
    px: 0.8,
    borderColor: devPlanColors.border,
    color: devPlanColors.primaryDark,
    bgcolor: devPlanColors.surface,
    fontSize: 11,
    fontWeight: 700,
  },

  rosterTableToolbar: {
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.6,
  },

  rosterProfileFilterSelect: {
    width: 210,
    bgcolor: '#fff',
    color: devPlanColors.primaryDark,
    border: `1px solid ${devPlanColors.primary}`,
    fontWeight: 700,

    '& .MuiSelect-button': {
      justifyContent: 'flex-start',
      textAlign: 'start',
    },

    '& .MuiSelect-indicator': {
      display: 'none',
    },
  },

  rosterProfileFilterValue: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '18px minmax(0, 1fr) auto',
    gap: 0.5,
    alignItems: 'center',
    justifyItems: 'start',
    textAlign: 'start',
  },

  rosterProfileFilterIcon: {
    display: 'grid',
    placeItems: 'center',
    color: devPlanColors.primary,
    '& svg': {
      fontSize: 15,
    },
  },

  rosterProfileFilterValuePrimary: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  rosterProfileFilterValueCount: {
    minWidth: 0,
    p: 0,
    color: devPlanColors.primary,
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1,
    justifySelf: 'end',
  },

  rosterProfileFilterListbox: {
    width: 210,
    minWidth: '210px !important',
    maxWidth: 210,
    maxHeight: 320,
    overflowX: 'hidden',
    overflowY: 'auto',
  },

  rosterProfileFilterOption: {
    minHeight: 38,
    py: 0.45,

    '&:hover': {
      bgcolor: '#eaf4ff',
    },

    '&[aria-selected="true"]': {
      bgcolor: '#dcecf8',
    },
  },

  rosterProfileFilterOptionContent: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '18px minmax(0, 1fr) auto',
    gap: 0.6,
    alignItems: 'center',
  },

  rosterProfileFilterOptionLabel: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  rosterProfileFilterOptionCount: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1,
    justifySelf: 'end',
  },

  sectionMeta: {
    color: devPlanColors.secondary,
    fontSize: 11,
  },

  usageGrid: {
    mt: 1.25,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(4, minmax(0, 1fr))',
    },
    borderTop: `1px solid ${devPlanColors.border}`,
    borderInlineStart: `1px solid ${devPlanColors.border}`,
  },

  usageCell: {
    minHeight: 70,
    p: 0.9,
    display: 'grid',
    alignContent: 'center',
    gap: 0.25,
    borderInlineEnd: `1px solid ${devPlanColors.border}`,
    borderBottom: `1px solid ${devPlanColors.border}`,
  },

  usageValue: {
    color: devPlanColors.primaryDark,
    fontSize: 18,
    fontWeight: 800,
  },

  usageLabel: {
    color: devPlanColors.secondary,
    fontSize: 10,
  },

  reliability: {
    mt: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    color: devPlanColors.secondary,
    fontSize: 11,
  },

  twoColumn: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1.25,
  },

  metricRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: 1,
    py: 0.8,
    borderBottom: `1px solid ${devPlanColors.border}`,
    '&:last-of-type': {
      borderBottom: 0,
    },
  },

  metricLabel: {
    color: devPlanColors.secondary,
    fontSize: 11,
  },

  metricValue: {
    color: devPlanColors.primaryDark,
    fontSize: 13,
    fontWeight: 800,
  },

  rosterSampleNotice: {
    mb: 1,
    px: 1,
    py: 0.65,
    borderRadius: 7,
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.secondary,
    fontSize: 12,
    fontWeight: 700,
  },
}
