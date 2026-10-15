// src/features/playersDatabase/ui/pages/teamPage/sx/teamHeader.sx.js
import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'
import {
  pageHeaderContextChipSx,
  pageHeaderFavoriteSx,
  pageHeaderMediaSx,
  pageHeaderTitleSx,
} from '../../../components/page/sx/pageHeader.sx.js'

export const teamHeaderSx = {
  pageTitle: {
    ...pageHeaderTitleSx,
    color: devPlanColors.primaryDark,
  },

  pageTitleLink: {
    color: 'inherit',
    textDecoration: 'none',
    borderRadius: 6,
    cursor: 'pointer',

    '&:hover, &:focus-visible': {
      textDecoration: 'none',
      outline: 'none',
    },

    '&:hover [data-team-title], &:focus-visible [data-team-title]': {
      color: devPlanColors.primary,
    },
  },

  titleRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    flexWrap: 'wrap',
  },

  teamLogo: {
    ...pageHeaderMediaSx,
    flex: '0 0 auto',
    objectFit: 'contain',
    border: `1px solid ${devPlanColors.primary}`,
    borderRadius: '50%',
    p: 0.25,
  },

  favoriteButton: {
    ...pageHeaderFavoriteSx,
  },

  contextChip: {
    ...pageHeaderContextChipSx,
    bgcolor: '#fff',
    border: `1px solid ${devPlanColors.primary}`,
    color: devPlanColors.primaryDark,
  },

  birthYearChip: {
    bgcolor: devPlanColors.tertiary,
    color: '#fff',
    borderColor: devPlanColors.primary,
    boxShadow: '0 6px 16px rgba(47, 134, 199, 0.20)',
  },

  clubLevelChip: {
    fontWeight: 800,
  },

  headerActions: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  headerActionsPanel: {
    gap: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },

  primaryButton: {
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  secondaryButton: {
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },
}
