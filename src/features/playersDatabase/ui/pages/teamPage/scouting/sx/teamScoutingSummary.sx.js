// src/features/playersDatabase/ui/pages/teamPage/scouting/sx/teamScoutingSummary.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const teamScoutingSummarySx = {
  section: {
    p: {
      xs: 1.25,
      md: 1.5,
    },
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 10,
    bgcolor: devPlanColors.surface,
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

  meta: {
    color: devPlanColors.secondary,
    fontSize: 11,
    mt: 0.2,
  },

  grid: {
    display: 'grid',
    gridAutoRows: '1fr',
    alignItems: 'stretch',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(3, minmax(0, 1fr))',
      lg: 'minmax(0, 4.5fr) minmax(0, 4.5fr) minmax(0, 3fr)',
    },
    gap: 1,
  },

  card: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    p: 0,
    textAlign: 'inherit',
    font: 'inherit',
  },

  cardBody: {
    minWidth: 0,
    p: 1.05,
    display: 'grid',
    alignContent: 'start',
    gap: 0.35,
  },

  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    minWidth: 0,
  },

  cardHeading: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
  },

  icon: {
    width: 24,
    height: 24,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 7,
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
  },

  cardLabel: {
    color: devPlanColors.secondary,
    fontSize: 10.5,
    fontWeight: 800,
  },

  status: {
    appearance: 'none',
    font: 'inherit',
    cursor: 'pointer',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    boxShadow: '0 2px 5px rgba(16, 43, 64, 0.12)',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 9px rgba(16, 43, 64, 0.18)',
    },
    '&:focus-visible': {
      outline: `2px solid ${devPlanColors.tertiary}`,
      outlineOffset: 2,
    },
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.3,
    px: 0.6,
    py: 0.3,
    borderRadius: 99,
    '& svg': {
      fontSize: 13,
    },
  },

  statusReview: {
    color: devPlanColors.surface,
    bgcolor: devPlanColors.petrol,
    border: `1px solid ${devPlanColors.petrolDark}`,
    '& svg, & p': {
      color: `${devPlanColors.surface} !important`,
    },
  },

  statusClear: {
    color: devPlanColors.secondary,
    bgcolor: devPlanColors.surface,
    border: `1px solid ${devPlanColors.border}`,
  },

  statusText: {
    color: 'inherit',
    fontSize: 10,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },

  cardTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 14.5,
    lineHeight: 1.3,
    fontWeight: 800,
    mt: 0.15,
  },

  cardTitleProminent: {
    fontSize: 17,
    fontWeight: 900,
    letterSpacing: '-0.01em',
    mt: 0.75,
  },

  cardActions: {
    display: 'grid',
    gap: 0.2,
    mt: 0.35,
    pt: 0.45,
    borderTop: `1px solid ${devPlanColors.border}`,
  },

  cardAction: {
    color: devPlanColors.tertiaryDark,
    fontSize: 10,
    fontWeight: 700,
    lineHeight: 1.35,
  },

  cardActionLabel: {
    color: devPlanColors.primaryDark,
    fontWeight: 900,
  },

  cardActionEmpty: {
    color: devPlanColors.secondary,
    fontWeight: 500,
  },
}
