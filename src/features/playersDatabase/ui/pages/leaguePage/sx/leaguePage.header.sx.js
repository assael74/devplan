// features/playersDatabase/ui/pages/leaguePage/sx/leaguePage.header.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leaguePageHeaderSx = {
  header: {
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        lg: 'minmax(760px, 1fr) auto',
      },
      gap: 2,
      alignItems: 'end',
    },

  headerCopy: {
      minWidth: 0,
      width: '100%',
      gap: 0.75,
      alignItems: 'flex-start',
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
      mr: 2
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
      pt: 1
    },

  titleChipTertiary: {
      bgcolor: devPlanColors.tertiaryLight,
      borderColor: devPlanColors.tertiary,
      color: devPlanColors.tertiary,
    },

  pageDescription: {
      maxWidth: 760,
      color: devPlanColors.secondary,
      textAlign: 'left',
    },
}
