// features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterContent.table.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterTableSx = {
  tablePanel: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    border: '1px solid #c8d7e2',
    boxShadow: '0 10px 24px rgba(16, 43, 64, 0.075)',
    bgcolor: '#fff',

    '& > div > div:first-of-type': {
      mx: -1.25,
      mt: -1.25,
      mb: 0.25,
      px: 1.5,
      py: 1.05,
      borderBottom: '1px solid #c8d7e2',
      bgcolor: '#edf3f7',
    },
  },

  tableArea: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  },

  tableCount: {
    px: 1,
    py: 0.5,
    borderRadius: 8,
    bgcolor: '#fff',
    border: `1px solid ${devPlanColors.primaryLight}`,
    color: devPlanColors.primary,
    fontWeight: 700,
  },

  tableScroll: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    borderRadius: 7,
    border: '1px solid #dbe4ea',

    '& table': { fontSize: 12 },
    '& th': {
      px: 1,
      py: 0.85,
      bgcolor: '#f4f7f9',
      borderBottom: '1px solid #b8c8d4',
    },
    '& td': { px: 1, py: 0.7, borderBottomColor: '#dce5eb' },
    '& tbody tr': { transition: 'background-color 140ms ease' },
    '& tbody tr:hover': { bgcolor: devPlanColors.tertiaryLight },
    '& button': { minWidth: 0, minHeight: 28, px: 1.25, fontSize: 12 },
  },

  tableBodyScroll: {
    height: '100%',
    maxHeight: 'none',
  },

  leagueNameColumn: { width: '38%', minWidth: 280 },
  leagueNameHeader: { textAlign: 'left', pl: 1.5, pr: 1.5 },
  leagueNameCell: { textAlign: 'left', pl: 1.5, pr: 1.5 },
  centerColumn: { textAlign: 'center' },
  countColumn: { width: 92, textAlign: 'center' },
  actionsColumn: { width: 130, textAlign: 'center' },
  rowActions: { alignItems: 'center', justifyContent: 'center', width: '100%' },

  createSeasonButton: {
    color: devPlanColors.primary,
    borderColor: devPlanColors.primaryLight,
    bgcolor: '#fff',
  },

  openLeagueButton: {
    color: devPlanColors.primary,
    bgcolor: devPlanColors.primaryLight,
    fontWeight: 700,

    '&:hover': {
      bgcolor: devPlanColors.tertiaryLight,
      color: devPlanColors.tertiary,
    },
  },
}
