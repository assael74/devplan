// src/features/playersDatabase/ui/pages/clubsPage/components/sx/clubsCollection.sx.js
import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const clubsCollectionSx = {
  stateBox: {
    minHeight: 220,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.75,
    color: devPlanColors.secondary,
  },

  collection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
    p: 1.25,
  },

  collectionItem: {
    contentVisibility: 'auto',
    containIntrinsicSize: '74px',
    overflow: 'hidden',
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 10,
    bgcolor: devPlanColors.surface,
    transition: 'box-shadow 180ms ease, border-color 180ms ease',
  },

  collectionItemOpen: {
    position: 'relative',
    zIndex: 1,
    overflow: 'visible',
    borderColor: devPlanColors.petrol,
    boxShadow: `0 8px 20px ${devPlanColors.primaryDark}40`,
  },

  collectionSummaryHeader: {
    p: 0.4,
  },

  collectionSummaryHeaderOpen: {
    position: 'sticky',
    top: 0,
    zIndex: 3,
    bgcolor: devPlanColors.petrolLight,
    borderBottom: `2px solid ${devPlanColors.petrol}`,
    boxShadow: `0 8px 12px -5px ${devPlanColors.primaryDark}99`,
    '&::after': {
      content: '""',
      position: 'absolute',
      zIndex: 1,
      right: 0,
      bottom: -10,
      left: 0,
      height: 10,
      pointerEvents: 'none',
      background: `linear-gradient(to bottom, ${devPlanColors.primaryDark}33, transparent)`,
    },
  },

  collectionContent: {
    overflow: 'hidden',
  },

  summaryHeader: {
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    pr: 1.25,
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    gap: 0,
    '& > :first-of-type': {
      flex: '1 1 auto',
      width: 'auto',
      minWidth: 0,
      maxWidth: 'none',
      overflow: 'hidden',
    },
    '& > :last-child': {
      flex: '0 0 auto',
      width: 'auto',
      minWidth: 0,
      maxWidth: 'none',
      overflow: 'hidden',
      justifyContent: 'center',
      gap: 0,
    },
  },

}
