// features/playersDatabase/ui/pages/leaguePage/sx/leagueTeams.columns.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueTeamsColumnsSx = {
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
}
