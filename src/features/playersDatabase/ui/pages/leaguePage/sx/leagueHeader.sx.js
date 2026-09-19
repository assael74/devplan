// src/features/playersDatabase/ui/pages/leaguePage/sx/leagueHeader.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueHeaderSx = {
  header: {
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(760px, 1fr) auto',
    },
  },

  leagueAvatar: {
    width: {
      xs: 42,
      md: 52,
    },
    height: {
      xs: 42,
      md: 52,
    },
    flexShrink: 0,
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
    flexShrink: 0,
    whiteSpace: 'nowrap',
    color: devPlanColors.primaryDark,
    fontSize: {
      xs: 34,
      md: 44,
    },
    lineHeight: 1.05,
    fontWeight: 700,
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
    color: devPlanColors.tertiary,
    fontSize: {
      xs: 34,
      md: 44,
    },
    fontWeight: 700,
    lineHeight: 1.05,
  },

  titleChip: {
    minHeight: 28,
    px: 1.2,
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    borderRadius: 999,
    bgcolor: devPlanColors.primaryLight,
    border: `1px solid ${devPlanColors.primary}`,
    color: devPlanColors.primary,
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: 'nowrap',
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
    minHeight: 38,
    px: 2,
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  secondaryButton: {
    minHeight: 38,
    px: 2,
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },
}
