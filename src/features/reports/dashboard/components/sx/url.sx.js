// src/features/reports/dashboard/components/sx/url.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const urlSx = {
  urlRoot: {
    minWidth: 0,
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1.5,
    px: 1.5,
    py: 1,
    bgcolor: 'background.body',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'lg',

    '@media (max-width: 620px)': {
      alignItems: 'stretch',
      flexDirection: 'column',
    },
  },

  urlMain: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  urlIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: 'primary.600',
    bgcolor: 'primary.softBg',
    borderRadius: 'md',
  },

  urlTextBlock: {
    minWidth: 0,
  },

  urlLabel: {
    mb: 0.2,
    fontWeight: 600,
    color: 'text.secondary',
  },

  urlValue: {
    minWidth: 0,
    color: 'text.primary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  urlButton: {
    minWidth: 108,
    flexShrink: 0,
    fontWeight: 700,
    borderRadius: 'md',
    color: '#FFFFFF',
    bgcolor: devPlanColors.primary,
    boxShadow: `0 10px 22px ${devPlanColors.primaryDark}22`,

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
      boxShadow: `0 12px 26px ${devPlanColors.primaryDark}33`,
    },

    '&:active': {
      bgcolor: devPlanColors.primaryDark,
    },

    '@media (max-width: 620px)': {
      width: '100%',
    },
  },
}
