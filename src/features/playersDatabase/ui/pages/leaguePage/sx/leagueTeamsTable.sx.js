// src/features/playersDatabase/ui/pages/leaguePage/sx/leagueTeamsTable.sx.js

import { dataTableVariantsSx as variantSx } from '../../../components/tables/dataTable/sx/dataTableVariants.sx.js'
import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueTeamsTableSx = {
  activeFilterChip: {
    '--Chip-radius': '6px',
    '--Chip-gap': '8px',
    minHeight: 26,
    minWidth: 150,
    px: 1.5,
    paddingInlineEnd: '3px',
    border: `1px solid ${devPlanColors.petrol}`,
    bgcolor: devPlanColors.surface,
    color: devPlanColors.petrolDark,
    fontWeight: 600,
  },

  activeFilterDelete: {
    '--IconButton-size': '22px',
    m: 0,
    borderRadius: '4px',
    bgcolor: 'transparent',
    color: devPlanColors.petrolDark,

    '&:hover': {
      bgcolor: devPlanColors.petrolLight,
    },
  },

  headerActions: {
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.75,
  },

  loadTime: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    color: 'neutral.500',
    fontSize: '0.68rem',
    fontWeight: 500,
    lineHeight: 1.25,
  },

  loadTimeDivider: {
    alignSelf: 'stretch',
    borderColor: 'neutral.400',
  },

  tableWrap: {
    ...variantSx.borderlessWrap,

    '& [data-column="attackPriority"], & [data-column="performanceSignal"], & [data-column="favorite"]': {
      borderInlineStart: `2px solid ${devPlanColors.border}`,
    },
  },
}
