// src/features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterTable.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterTableSx = {
  workControls: {
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 1.5,
  },

  minimumButton: {
    minWidth: 32,
    px: 0.75,
  },

  tablePanel: {
    width: '100%',
    height: '100%',
    borderColor: '#c8d7e2',
    boxShadow: '0 10px 24px rgba(16, 43, 64, 0.075)',

    '& > :first-of-type': {
      bgcolor: devPlanColors.petrolLight,
      borderBottomColor: devPlanColors.petrol,
      flexWrap: 'wrap',

      '& > :last-child': {
        maxWidth: '100%',
      },

      '& .MuiTypography-root': {
        color: devPlanColors.primaryDark,
      },
    },
  },

  tableScroll: {
    border: 0,
    borderRadius: 0,

    '& [data-column="statsLoaded"], & [data-column="matchingTeams"], & [data-column="tableImportedAt"]': {
      borderInlineStart: `2px solid ${devPlanColors.border}`,
    },

    '& [data-column="matchingTeams"]': {
      borderInlineStartColor: 'success.300',
    },

    '& table': {
      fontSize: 12,
    },
    '& th': {
      px: 1,
      py: 0.85,
      bgcolor: '#f4f7f9',
      borderBottom: '1px solid #b8c8d4',
    },
    '& thead th:first-of-type': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
    '& thead th:last-of-type': {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    '& td': {
      px: 1,
      py: 0.7,
      borderBottomColor: '#dce5eb',
    },

    '& button:not(.MuiChip-root):not(.MuiChip-action)': {
      minWidth: 0,
      minHeight: 28,
      px: 1.25,
      fontSize: 12,
    },
  },

  tableBodyScroll: {
    height: '100%',
    maxHeight: 'none',
  },

  groupHeaderCell: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    p: '0 !important',
    '--TableCell-dataBackground': '#dbeaf5',
    bgcolor: '#dbeaf5 !important',
    opacity: 1,
    borderTop: '1px solid #aac4d7',
    borderBottom: '1px solid #9cb8cd',
    boxShadow: '0 2px 5px rgba(23, 67, 96, 0.12)',
  },

  groupHeaderMessage: {
    px: 1.25,
    py: 0.45,
    textAlign: 'left',
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 700,
  },

  openLeagueButton: {
    minHeight: 32,
    px: 1.5,
    bgcolor: devPlanColors.tertiaryLight,
    color: devPlanColors.tertiaryDark,
    borderColor: devPlanColors.tertiary,
    fontSize: 12,
    fontWeight: 700,
    boxShadow: '0 3px 8px rgba(23, 107, 166, 0.12)',

    '&:hover': {
      bgcolor: '#dcebff',
      borderColor: devPlanColors.tertiaryDark,
    },

    '&.Mui-disabled': {
      bgcolor: devPlanColors.secondaryLight,
      color: devPlanColors.secondary,
      boxShadow: 'none',
    },
  },

  noRowHoverTable: {
    '& tbody tr:hover': {
      bgcolor: 'transparent',
    },

    '& tbody tr:hover td': {
      bgcolor: 'transparent',
      '--TableCell-dataBackground': 'transparent',
    },
  },
}
