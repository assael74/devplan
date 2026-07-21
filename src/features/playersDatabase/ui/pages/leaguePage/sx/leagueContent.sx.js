// features/playersDatabase/ui/pages/leaguePage/sx/leagueContent.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueContentSx = {
  rankColumn: {
      width: 62,
      minWidth: 58,
      maxWidth: 68,
    },

  rankBadge: {
      minWidth: 26,
      height: 24,
      px: 0.75,
      mx: 'auto',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6,
      bgcolor: '#edf4fd',
      border: '1px solid #cfe0f6',
      color: devPlanColors.primaryDark,
      fontWeight: 700,
      lineHeight: 1,
    },

  avatarColumn: {
      width: 42,
      minWidth: 38,
      maxWidth: 44,
    },

  teamAvatar: {
      width: 26,
      height: 26,
      mx: 'auto',
      display: 'block',
      objectFit: 'contain',
      borderRadius: '50%',
    },

  leagueTable: {
      '& th:first-of-type, & td:first-of-type': {
        textAlign: 'center',
        pr: 1,
        pl: 1,
      },

      '& th:nth-of-type(3), & td:nth-of-type(3)': {
        textAlign: 'left',
        pr: 1.5,
        pl: 1.5,
      },
    },

  teamNameColumn: {
      width: '21%',
      minWidth: 126,
    },

  teamNameHeader: {
      textAlign: 'left',
    },

  teamNameCell: {
      textAlign: 'left',
    },

  teamNameInherit: {
    color: 'inherit',
    fontWeight: 'inherit',
  },

  teamNameStatus: {
    emptyRoster: {
      color: '#9AA6AF',
      fontWeight: 500,
      opacity: 0.72,
    },

    rosterOnly: {
      color: devPlanColors.secondary,
      fontWeight: 600,
      opacity: 1,
    },

    hasProfiles: {
      color: devPlanColors.primary,
      fontWeight: 700,
      opacity: 1,
    },
  },

  compactTableColumn: {
      width: 72,
      minWidth: 58,
    },

  priorityColumn: {
      width: 94,
      minWidth: 78,
    },

  rosterProfilesColumn: {
      width: 92,
      minWidth: 84,
      whiteSpace: 'normal',
      lineHeight: 1.15,
    },

  rosterProfilesCell: {
      minWidth: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0.35,
      px: 0.75,
      py: 0.35,
      borderRadius: 999,
      bgcolor: '#f6f9fc',
      border: '1px solid #e4edf6',
      color: devPlanColors.primaryDark,
      lineHeight: 1,
    },

  rosterProfilesValue: {
      minWidth: 14,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1,
    },

  rosterProfilesDivider: {
      color: devPlanColors.secondary,
      fontSize: 11,
      lineHeight: 1,
    },

  actionColumn: {
      width: 86,
      minWidth: 86,
      maxWidth: 90,
    },

  rowActions: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexWrap: 'nowrap',
      gap: 0.5,
      width: 70,
      minWidth: 70,
    },

  tableButton: {
      width: 30,
      height: 30,
      minWidth: 30,
      minHeight: 30,
      p: 0,
      color: devPlanColors.primary,
      borderColor: devPlanColors.primaryLight,
      bgcolor: '#fff',

      '&:hover': {
        bgcolor: devPlanColors.primaryLight,
        borderColor: devPlanColors.primary,
      },
    },

  insightsPanel: {
      height: '100%',
      minHeight: 0,
      overflow: 'hidden',
    },

  insightsList: {
      minHeight: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      pr: 0.5,
    },

  actionSeasonBox: {
      display: 'grid',
      gap: 0.5,
      p: 1,
      borderRadius: 8,
      bgcolor: devPlanColors.tertiaryLight,
      border: `1px solid ${devPlanColors.tertiary}`,
    },

  actionSeasonLabel: {
      color: devPlanColors.tertiary,
      fontWeight: 700,
    },

  actionSeasonSelect: {
      width: '100%',
      minHeight: 34,
      bgcolor: '#fff',
      color: devPlanColors.primaryDark,
      borderColor: '#b9d8ef',
      fontWeight: 700,
    },

  priorityFiltersRow: {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 0.75,
    },

  sidePanelDivider: {
      my: 0.25,
      borderColor: '#dbe5f4',
    },

  sideLoadButton: {
      width: '100%',
      minHeight: 42,
      justifyContent: 'flex-start',
      px: 1.5,
      bgcolor: devPlanColors.primary,
      color: '#fff',

      '& .MuiButton-startDecorator': {
        mr: 0.75,
      },

      '&:hover': {
        bgcolor: devPlanColors.primaryDark,
      },
    },

  sideDeleteButton: {
      width: '100%',
      minHeight: 42,
      justifyContent: 'flex-start',
      px: 1.5,
      bgcolor: '#fff',
      color: '#9a1b1b',
      borderColor: '#f1b6b6',

      '& .MuiButton-startDecorator': {
        mr: 0.75,
      },

      '&:hover': {
        bgcolor: '#fff1f1',
        borderColor: '#d84a4a',
      },
    }
}
