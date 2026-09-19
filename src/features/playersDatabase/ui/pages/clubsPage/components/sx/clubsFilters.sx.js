// src/features/playersDatabase/ui/pages/clubsPage/components/sx/clubsFilters.sx.js
import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const clubsFiltersSx = {
  filterChipGroup: {
    flexWrap: 'wrap',
    gap: 0.5,
    justifyContent: 'center',
  },

  clubLevelFilterChip: {
    '--Chip-minHeight': '26px',
    '--Chip-paddingInline': '8px',
    minWidth: 34,
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    fontWeight: 800,

    '& .MuiChip-label': {
      width: '100%',
      textAlign: 'center',
    },
  },

  leaguePathFilterChip: {
    '--Chip-minHeight': '30px',
    '--Chip-paddingInline': '9px',
    width: 'fit-content',
    maxWidth: '100%',
    mx: 'auto',
    justifyContent: 'center',
    cursor: 'pointer',
    fontWeight: 700,
  },

  sideTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 800,
    alignSelf: 'stretch',
  },

  sideSubtitle: {
    mt: 0.25,
    color: devPlanColors.secondary,
    lineHeight: 1.5,
    alignSelf: 'stretch',
  },

  filterLabel: {
    mb: 0.45,
    color: devPlanColors.secondary,
    fontWeight: 700,
    alignSelf: 'stretch',
  },

  filterControl: {
    width: '100%',
    bgcolor: devPlanColors.surface,
  },

  sideSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  resetButton: {
    width: '86%',
    maxWidth: 220,
    mx: 'auto',
  },

}
