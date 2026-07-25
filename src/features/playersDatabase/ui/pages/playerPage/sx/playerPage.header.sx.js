// features/playersDatabase/ui/pages/playerPage/sx/playerPage.header.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerPageHeaderSx = {
  header: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(0, 1fr) auto',
    },
    gap: 2,
    alignItems: 'stretch',
  },

  headerCopy: {
    minWidth: 0,
    height: '100%',
    gap: 0.75,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  titleRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    flexWrap: 'wrap',
  },

  playerAvatar: {
    width: {
      xs: 58,
      md: 68,
    },
    height: {
      xs: 58,
      md: 68,
    },
    display: 'block',
    objectFit: 'cover',
    borderRadius: '50%',
    border: `3px solid ${devPlanColors.primaryLight}`,
    boxShadow: '0 5px 14px rgba(16, 43, 64, 0.12)',
  },

  pageTitle: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize: {
      xs: 34,
      md: 44,
    },
    lineHeight: 1.05,
    fontWeight: 700,
  },

  birthYearChip: {
    minHeight: 38,
    px: 1.8,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    bgcolor: devPlanColors.tertiary,
    border: `1px solid ${devPlanColors.primary}`,
    color: '#fff',
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    boxShadow: '0 8px 20px rgba(47, 134, 199, 0.24)',
  },
}
