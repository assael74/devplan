// features/playersDatabase/ui/pages/searchPage/query/sx/searchContextQuery.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchContextQuerySx = {
  root: {
    gap: 1.8,
  },

  contextGroup: {
    gap: 0.85,
  },

  contextFiltersRow: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 1.1,
  },

  filterGroup: {
    gap: 0.7,
  },

  inlineFilterGroup: {
    width: 'auto',
    minWidth: 0,
    gap: 0.45,
  },

  contextFiltersDivider: {
    alignSelf: 'stretch',
    mx: 0.6,
    my: 0.15,
  },

  groupLabel: {
    mb: 0,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
    lineHeight: '20px',
  },

  chipGroup: {
    flexWrap: 'wrap',
    gap: 0.4,
  },

  filterChip: {
    '--Chip-minHeight': '26px',
    '--Chip-paddingInline': '8px',
    fontSize: '0.78rem',
    cursor: 'pointer',

    '&[data-variant="solid"]': {
      bgcolor: devPlanColors.primary,
    },
  },

  expectedLevelChip: {
    '--Chip-minHeight': '26px',
    '--Chip-paddingInline': '0px',
    minWidth: 28,
    cursor: 'pointer',

    '& .MuiChip-label': {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },

  expectedLevelIcon: {
    display: 'block',
    fontSize: 17,
    lineHeight: 1,
  },
}
