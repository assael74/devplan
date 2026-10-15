// src/features/playersDatabase/ui/pages/playerPage/sx/playerHeader.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'
import {
  pageHeaderContextChipSx,
  pageHeaderFavoriteSx,
  pageHeaderMediaSx,
  pageHeaderTitleSx,
} from '../../../components/page/sx/pageHeader.sx.js'

export const playerHeaderSx = {
  header: {
    alignItems: 'stretch',
  },

  titleRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    flexWrap: 'wrap',
  },

  playerAvatar: {
    ...pageHeaderMediaSx,
    display: 'block',
    objectFit: 'cover',
    borderRadius: '50%',
    border: `3px solid ${devPlanColors.primaryLight}`,
    boxShadow: '0 5px 14px rgba(16, 43, 64, 0.12)',
  },

  pageTitle: {
    ...pageHeaderTitleSx,
    minWidth: 0,
    color: devPlanColors.primaryDark,
  },

  favoriteButton: {
    ...pageHeaderFavoriteSx,
  },

  teamChip: {
    ...pageHeaderContextChipSx,
    minWidth: 0,
    maxWidth: 180,
    gap: 0.55,
    bgcolor: '#fff',
    border: `1px solid ${devPlanColors.border}`,
    color: devPlanColors.primaryDark,
  },

  teamAvatar: {
    width: 21,
    height: 21,
    borderRadius: '50%',
    border: `1px solid ${devPlanColors.border}`,
    objectFit: 'cover',
    flexShrink: 0,
  },

  birthYearChip: {
    ...pageHeaderContextChipSx,
    bgcolor: devPlanColors.tertiary,
    border: `1px solid ${devPlanColors.primary}`,
    color: '#fff',
    boxShadow: '0 8px 20px rgba(47, 134, 199, 0.24)',
  },

  seasonChip: {
    ...pageHeaderContextChipSx,
    bgcolor: devPlanColors.primaryLight,
    border: `1px solid ${devPlanColors.primary}`,
    color: devPlanColors.primary,
  },

  leagueChip: {
    ...pageHeaderContextChipSx,
    maxWidth: 290,
    bgcolor: '#fff',
    border: `1px solid ${devPlanColors.primary}`,
    color: devPlanColors.primaryDark,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  headerActionsPanel: {
    height: '100%',
    gap: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },

  headerActions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },

  primaryButton: {
    gap: 0.75,
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  secondaryButton: {
    gap: 0.75,
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },

    '&:disabled': {
      bgcolor: '#f4f7fa',
      borderColor: '#d6e0ea',
      color: '#96a4b1',
    },
  },
}
