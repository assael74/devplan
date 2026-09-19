// src/features/playersDatabase/ui/pages/clubsPage/components/sx/clubSummaryRow.sx.js
import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const clubSummaryRowSx = {
  summaryRow: {
    p: 0,
    display: 'flex',
    flex: '0 0 100%',
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    overflow: 'hidden',
    gap: 0,
    alignItems: 'stretch',
    boxShadow: 'none',
    '& > *': {
      minWidth: 0,
      alignSelf: 'stretch',
      overflow: 'hidden',
      boxSizing: 'border-box',
    },
    '& > :nth-of-type(1)': {
      flex: '0 0 30%',
      width: '30%',
      maxWidth: '30%',
    },
    '& > :nth-of-type(2)': {
      flex: '0 0 70%',
      width: '70%',
      maxWidth: '70%',
    },
    '& > * + *': {
      minHeight: 48,
      borderInlineStart: `1px solid ${devPlanColors.border}`,
      paddingInlineStart: 1.25,
    },
    '@media (max-width: 900px)': {
      flexWrap: 'wrap',
      '& > :nth-of-type(n)': {
        flex: '0 0 50%',
        maxWidth: '50%',
      },
      '& > * + *': {
        minHeight: 0,
        borderInlineStart: 0,
        paddingInlineStart: 0,
      },
    },
  },

  summaryAreaBox: {
    minHeight: 42,
    display: 'grid',
    placeItems: 'center',
  },

  summaryAreaContentBox: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    '& > *': {
      width: '100%',
      minWidth: 0,
      maxWidth: '100%',
      overflow: 'hidden',
    },
  },

  summaryClubAreaContentBox: {
    minHeight: 50,
    pb: 1,
    boxSizing: 'border-box',
  },

  summaryClubIdentityContent: {
    pl: 0.8,
    pr: 0.5,
    height: '100%',
    alignSelf: 'stretch',
    boxSizing: 'border-box',
    '& > :first-of-type': {
      width: 36,
      height: 36,
    },
    '& [aria-label^="רמת מועדון"]': {
      left: -4,
      bottom: -4,
      minWidth: 18,
      height: 18,
      px: 0.25,
      pt: 0.2,
      borderRadius: 9,
      fontSize: 8,
    },
  },

  summaryAreaPlaceholder: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  summarySpotlightAreaContentBox: {
    minHeight: 50,
    px: 1.25,
    py: 0.4,
    boxSizing: 'border-box',
  },

}
