// features/playersDatabase/ui/pages/searchPage/query/sx/searchDocumentsSummary.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchDocumentsSummarySx = {
  sectionContent: {
    display: 'flex',
    minHeight: 0,
  },

  root: {
    minWidth: 0,
    width: '100%',
    minHeight: 285,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.8,
  },

  countCard: {
    minWidth: 0,
    p: 1,
    display: 'grid',
    justifyItems: 'center',
    gap: 0.45,
    border: '1px solid #dbe5f4',
    borderRadius: 8,
    bgcolor: '#f9fbfd',
    textAlign: 'center',
  },

  label: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  value: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
    lineHeight: 1,
  },

  description: {
    maxWidth: 220,
    color: devPlanColors.secondary,
  },

  activeItems: {
    minWidth: 0,
    maxHeight: 118,
    display: 'flex',
    alignContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 0.45,
    overflowX: 'hidden',
    overflowY: 'auto',
  },

  chip: {
    maxWidth: '100%',
    color: devPlanColors.primary,
    bgcolor: devPlanColors.primaryLight,

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },

  removeChipButton: {
    minWidth: 18,
    minHeight: 18,
    width: 18,
    height: 18,
    p: 0,
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '50%',
    color: devPlanColors.secondary,
    bgcolor: 'transparent',
    cursor: 'pointer',

    '&:hover': {
      color: devPlanColors.primaryDark,
      bgcolor: 'rgba(23, 59, 87, 0.10)',
    },
  },

  emptyItems: {
    width: '100%',
    py: 1,
    color: devPlanColors.secondary,
    textAlign: 'center',
  },

  loadButton: {
    width: '100%',
    minHeight: 34,
    mt: 'auto',
    color: '#fff',
    bgcolor: devPlanColors.primary,
    whiteSpace: 'nowrap',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },
}
