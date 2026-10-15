// src/features/playersDatabase/ui/pages/teamPage/structure/sx/teamStructure.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const teamStructureSx = {
  section: {
    p: {
      xs: 1.25,
      md: 1.5,
    },
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 10,
    bgcolor: devPlanColors.surface,
    minWidth: 0,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 2,
  },

  titleRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.65,
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

  title: {
    color: devPlanColors.primaryDark,
    fontSize: 15,
    fontWeight: 800,
  },

  exportButton: {
    minHeight: 28,
    px: 0.8,
    borderColor: devPlanColors.border,
    color: devPlanColors.primaryDark,
    bgcolor: devPlanColors.surface,
    fontSize: 11,
    fontWeight: 700,
  },

  linesGrid: {
    display: 'grid',
    gridAutoRows: '1fr',
    alignItems: 'stretch',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(4, minmax(0, 2.25fr)) minmax(0, 3fr)',
    },
    gap: 1,
  },

  lineCard: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    p: 0,
    textAlign: 'inherit',
    font: 'inherit',
  },

  lineBody: {
    minWidth: 0,
    p: 0.75,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    minHeight: 78,
    gap: 0.25,
  },

  lineHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.6,
    minWidth: 0,
  },

  lineHeading: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
  },

  lineIcon: {
    width: 24,
    height: 24,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 7,
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
  },

  lineLabel: {
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 800,
  },

  lineMetricRow: {
    display: 'flex',
    alignItems: 'flex-end',
    alignSelf: 'center',
    justifyContent: 'space-between',
    gap: 0.6,
    px: 1.1,
    mt: 0.2,
  },

  lineValue: {
    color: devPlanColors.primaryDark,
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 800,
  },

  referenceChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.25,
    px: 0.5,
    py: 0.25,
    mb: 0.1,
    borderRadius: 99,
    border: `1px solid ${devPlanColors.border}`,
    bgcolor: devPlanColors.surface,
    color: devPlanColors.secondary,
  },

  referenceChipIcon: {
    display: 'inline-flex',
    '& svg': {
      fontSize: 11,
    },
  },

  referenceChipText: {
    color: 'inherit',
    fontSize: 9.5,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },

  coverageText: {
    color: devPlanColors.secondary,
    fontSize: 10.5,
    lineHeight: 1.4,
  },

  tableContent: {
    mt: 1.25,
    pt: 1.25,
    borderTop: `1px solid ${devPlanColors.border}`,
  },

  tableIntro: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 0.75,
  },

  tableTitleRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.55,
  },

  tableTitleIcon: {
    display: 'grid',
    placeItems: 'center',
    width: 21,
    height: 21,
    borderRadius: 6,
    border: `1px solid ${devPlanColors.primaryDark}`,
    bgcolor: devPlanColors.primary,
    color: devPlanColors.surface,
    '& svg': {
      color: `${devPlanColors.surface} !important`,
      fontSize: 13,
    },
  },

  tableTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 14,
    fontWeight: 800,
  },

}
