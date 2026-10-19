// src/features/playersDatabase/ui/pages/leaguePage/sx/leagueTeams.columns.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueTeamsColumnsSx = {
  workAreaCell: {
    bgcolor: 'neutral.100',
  },

  workAreaHeader: {
    '&&': { bgcolor: devPlanColors.primaryLight },
  },

  teamNameHeader: {
    '& > button': {
      justifyContent: 'flex-start',
    },
  },

  teamSignalsCell: {
    display: 'grid',
    gap: 0.5,
  },

  teamIdentityLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    color: 'inherit',
    textDecoration: 'none',
  },

  investigationIcon: {
    display: 'inline-flex',
    color: 'primary.600',
  },

  investigationStatus: marked => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    flexShrink: 0,
    boxSizing: 'border-box',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: marked ? 'success.200' : 'neutral.300',
    color: marked ? 'success.600' : 'neutral.500',
    bgcolor: marked ? 'success.50' : 'neutral.50',
    lineHeight: 1,
  }),

  teamLogoWrap: {
    width: 34,
    height: 34,
    boxSizing: 'border-box',
    border: `2px solid ${devPlanColors.tertiary}`,
    borderRadius: '50%',
    bgcolor: devPlanColors.primaryLight,
    mx: 'auto',
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
  },

  teamLogo: {
    width: 28,
    height: 28,
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

  statsLoadedIndicator: loaded => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    boxSizing: 'border-box',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: loaded ? 'success.300' : 'transparent',
    bgcolor: loaded ? 'success.50' : 'transparent',
    color: loaded ? 'success.600' : 'neutral.500',
    fontSize: 18,
    lineHeight: 1,
  }),

  statsGamesGap: gap => {
    const known = gap !== null
    const color = gap === 0 ? 'success' : 'warning'

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: known ? 24 : 0,
      minHeight: 24,
      px: known ? 0.75 : 0,
      boxSizing: 'border-box',
      borderRadius: '6px',
      border: known ? '1px solid' : 'none',
      borderColor: known ? `${color}.300` : 'transparent',
      bgcolor: known ? `${color}.50` : 'transparent',
      color: known ? `${color}.700` : 'text.secondary',
      fontWeight: known ? 700 : 500,
      lineHeight: 1,
    }
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
