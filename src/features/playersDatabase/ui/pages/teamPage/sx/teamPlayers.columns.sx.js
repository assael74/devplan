// features/playersDatabase/ui/pages/teamPage/sx/teamPlayers.columns.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamPlayersColumnsSx = {
  indexColumn: {
    width: 50,
    minWidth: 50,
    maxWidth: 50,
    px: 0.5,
    textAlign: 'center',
  },

  avatarColumn: {
    width: 44,
    minWidth: 44,
    maxWidth: 44,
    px: 0.5,
    textAlign: 'center',
  },

  playerNameColumn: {
    width: '18%',
    textAlign: 'left !important',
  },

  playerNameHeader: {
    textAlign: 'left !important',
    pl: 1.5,
  },

  playerNameCell: {
    textAlign: 'left !important',
    pl: 1.5,
  },

  playerNameContent: {
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.65,
  },

  playerNameText: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  playerStatusBadge: color => ({
    width: 20,
    height: 20,
    minWidth: 20,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: `var(--joy-palette-${color}-700)`,
    bgcolor: `var(--joy-palette-${color}-100)`,
    border: `1px solid var(--joy-palette-${color}-300)`,
    lineHeight: 1,

    '& svg': {
      fontSize: 13,
    },
  }),

  layerColumn: {
    width: 98,
    minWidth: 98,
    textAlign: 'center',
  },

  positionColumn: {
    width: 108,
    minWidth: 108,
    textAlign: 'center',
  },

  statColumn: {
    width: 54,
    textAlign: 'center',
  },

  minutesColumn: {
    width: 58,
    textAlign: 'center',
  },

  profileColumn: {
    width: '17%',
  },

  profileCell: {
    width: '100%',
    minWidth: 0,
    py: 0.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
  },

  actionsColumn: {
    width: 82,
    textAlign: 'center',
  },

  playerAvatar: {
    width: 28,
    height: 28,
    display: 'block',
    mx: 'auto',
    objectFit: 'cover',
    borderRadius: '50%',
    border: `1px solid ${devPlanColors.primaryLight}`,
  },

  rowActions: {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    gap: 0.5,
  },

  tableIconButton: {
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
