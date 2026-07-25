// features/playersDatabase/ui/pages/teamPage/sx/teamContent.table.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamContentTableSx = {
  tableWrap: {
      width: '100%',
      height: '100%',
      minWidth: 0,
      minHeight: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      border: 0,
      borderRadius: 0,
    },

  playersTable: {
      width: '100%',
      minWidth: 0,
      tableLayout: 'fixed',

      '& th, & td': {
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },

      '& th[data-column="fullName"], & td[data-column="fullName"]': {
        textAlign: 'left',
      },
    },

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

  profileTooltip: {
      minWidth: 190,
      display: 'grid',
      gap: 0.45,
      py: 0.25,
    },

  profileTooltipTitle: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
    },

  profileTooltipMeta: {
      color: 'rgba(255, 255, 255, 0.72)',
      fontSize: 11,
    },

  profileTooltipItem: {
      position: 'relative',
      pl: 2.5,
      color: '#fff',
      fontSize: 11,

      '&::before': {
        content: '""',
        position: 'absolute',
        insetInlineStart: 0.5,
        top: '50%',
        width: 5,
        height: 5,
        borderRadius: '50%',
        bgcolor: devPlanColors.tertiary,
        transform: 'translateY(-50%)',
      },
    },

  profileTooltipList: {
      display: 'grid',
      gap: 0.75,
    },

  reliabilityColumn: {
      width: 76,
      textAlign: 'center',
    },

  priorityColumn: {
      width: 96,
      textAlign: 'center',
    },

  actionsColumn: {
      width: 82,
      textAlign: 'center',
    },

  roleChip: {
      minWidth: 74,
      maxWidth: '100%',
      justifyContent: 'center',
      px: 0.75,
      minHeight: 26,
      borderRadius: 7,
      cursor: 'pointer',
      color: devPlanColors.primaryDark,
      bgcolor: '#f1f6fb',
      border: '1px solid #d7e5f2',
      fontSize: 11,
      fontWeight: 600,

      '&:hover': {
        bgcolor: devPlanColors.primaryLight,
        borderColor: '#9bc7e8',
      },
    },

  roleChipSelected: {
      color: devPlanColors.primaryDark,
      bgcolor: devPlanColors.tertiaryLight,
      borderColor: devPlanColors.tertiary,
      fontWeight: 700,
      boxShadow: '0 2px 8px rgba(47, 134, 199, 0.16)',

      '&:hover': {
        color: '#fff',
        bgcolor: devPlanColors.tertiary,
        borderColor: devPlanColors.tertiary,
      },
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

  tableButton: {
      minWidth: 0,
      minHeight: 28,
      maxWidth: '100%',
      px: 1,
      overflow: 'hidden',
      color: devPlanColors.primary,
      borderColor: devPlanColors.primaryLight,
      bgcolor: '#fff',
      whiteSpace: 'nowrap',

      '&:hover': {
        bgcolor: devPlanColors.primaryLight,
        borderColor: devPlanColors.primary,
      },
    }

}
