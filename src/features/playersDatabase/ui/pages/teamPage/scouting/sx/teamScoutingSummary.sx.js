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
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(3, minmax(0, 1fr))',
      lg: 'minmax(0, 4.5fr) minmax(0, 4.5fr) minmax(0, 3fr)',
    },
    gap: 1,
  },

  card: {
    position: 'relative',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 9,
    border: `1px solid ${devPlanColors.border}`,
    bgcolor: devPlanColors.surface,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    p: 0,
    textAlign: 'inherit',
    font: 'inherit',
    transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
  },

  cardReview: {
    bgcolor: devPlanColors.petrolLight,
  },

  cardClear: {
    bgcolor: 'rgba(101, 118, 132, 0.16)',
  },

  cardClickable: {
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 7px 16px rgba(23, 59, 87, 0.16)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },

  cardSelected: {
    border: `1px solid ${devPlanColors.secondary}`,
    borderColor: devPlanColors.secondary,
    bgcolor: 'rgba(101, 118, 132, 0.24)',
    boxShadow: '0 5px 12px rgba(78, 91, 102, 0.16), inset 0 0 0 1px rgba(78, 91, 102, 0.22)',
  },

  cardReviewSelected: {
    border: `1px solid ${devPlanColors.petrol}`,
    borderColor: devPlanColors.petrol,
    bgcolor: devPlanColors.petrolLight,
    boxShadow: `0 6px 14px rgba(43, 124, 130, 0.18), inset 0 0 0 1px ${devPlanColors.petrol}`,
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

  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.65,
    minWidth: 0,
  },

  referenceChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.25,
    flexShrink: 0,
    px: 0.5,
    py: 0.25,
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

  cardExplanation: {
    color: devPlanColors.secondary,
    fontSize: 10.5,
    lineHeight: 1.45,
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
