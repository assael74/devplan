// src/features/playersDatabase/ui/pages/leaguePage/sx/leagueHeader.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'
import {
  pageHeaderContextChipSx,
  pageHeaderMediaSx,
  pageHeaderTitleSx,
} from '../../../components/page/sx/pageHeader.sx.js'

export const leagueHeaderSx = {
  leagueAvatar: {
    ...pageHeaderMediaSx,
    bgcolor: '#fff',
    border: `1px solid ${devPlanColors.primaryLight}`,
  },

  leagueAvatarLink: {
    cursor: 'pointer',
    transition: 'transform 140ms ease, box-shadow 140ms ease',

    '&:hover': {
      transform: 'scale(1.06)',
      boxShadow: `0 0 0 3px ${devPlanColors.primaryLight}`,
    },
  },

  pageTitle: {
    ...pageHeaderTitleSx,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    color: devPlanColors.primaryDark,
  },

  titleRow: {
    minWidth: 0,
    display: 'flex',
    flexWrap: {
      xs: 'wrap',
      md: 'nowrap',
    },
    alignItems: 'center',
    gap: 1,
    justifyContent: 'flex-start',
  },

  titleRegion: {
    ...pageHeaderTitleSx,
    color: devPlanColors.tertiary,
  },

  titleChip: {
    ...pageHeaderContextChipSx,
    flexShrink: 0,
    bgcolor: devPlanColors.primaryLight,
    border: `1px solid ${devPlanColors.primary}`,
    color: devPlanColors.primary,
  },

  titleChips: {
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: 1,
    pt: 1,
  },

  titleChipTertiary: {
    bgcolor: devPlanColors.tertiaryLight,
    borderColor: devPlanColors.tertiary,
    color: devPlanColors.tertiary,
  },

  actionsPanel: {
    gap: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },

  actions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
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
