// features/playersDatabase/ui/components/modals/sx/dataImport.table.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const dataImportTableSx = {
  tableWrap: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    overflow: 'auto',
  },

  table: {
    width: '100%',
    minWidth: 980,
    fontSize: 11,
    borderCollapse: 'separate',
    borderSpacing: 0,

    '& thead': {
      position: 'sticky',
      top: 0,
      zIndex: 3,
      bgcolor: '#f5f8fd',
    },

    '& thead th': {
      position: 'sticky',
      top: 0,
      zIndex: 4,
      bgcolor: '#f5f8fd',
      boxShadow: '0 1px 0 #dbe5f4',
    },

    '& th': {
      px: 0.65,
      py: 0.65,
      bgcolor: '#f5f8fd',
      color: devPlanColors.primaryDark,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      textAlign: 'center',
      verticalAlign: 'middle',
    },

    '& td': {
      px: 0.45,
      py: 0.35,
      verticalAlign: 'middle',
      textAlign: 'center',
    },
  },

  statusColumn: {
    width: 48,
    minWidth: 48,
    maxWidth: 48,
  },

  statusCell: {
    minHeight: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusIconValid: {
    color: '#168a4a',
  },

  statusIconInvalid: {
    color: '#b45309',
  },

  cellText: {
    minHeight: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.2,
  },

  cellInput: {
    width: '100%',
    minWidth: 54,
    minHeight: 28,
    px: 0.5,
    bgcolor: 'transparent',

    '& input': {
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 1.2,
      textAlign: 'center',
    },

    '&:focus-within': {
      bgcolor: devPlanColors.primaryLight,
    },
  },

  cellAutocomplete: {
    width: '100%',
    minWidth: 180,
    minHeight: 28,
    bgcolor: 'transparent',

    '& input': {
      fontSize: 11,
      fontWeight: 400,
      textAlign: 'right',
    },

    '&:focus-within': {
      bgcolor: devPlanColors.primaryLight,
    },
  },

  cellSelect: {
    width: '100%',
    minWidth: 54,
    minHeight: 28,
    bgcolor: 'transparent',

    '& button': {
      fontSize: 11,
      fontWeight: 400,
    },

    '&:focus-within': {
      bgcolor: devPlanColors.primaryLight,
    },
  },

  cellSelectChanged: {
    bgcolor: '#fff3e0',
    borderColor: '#f59e0b',
    color: '#92400e',

    '& button': {
      color: '#92400e',
    },
  },
}
