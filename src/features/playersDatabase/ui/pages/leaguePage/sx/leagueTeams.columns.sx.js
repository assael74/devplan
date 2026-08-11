// features/playersDatabase/ui/pages/leaguePage/sx/leagueTeams.columns.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueTeamsColumnsSx = {
  teamAvatar: {
    width: 26,
    height: 26,
    mx: 'auto',
    display: 'block',
    objectFit: 'contain',
    borderRadius: '50%',
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

  rosterProfilesColumn: {
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

  actionHeader: {
    p: 0.75,
  },

  rowActions: {
    width: 70,
    minWidth: 70,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'nowrap',
    gap: 0.5,
  },
}
