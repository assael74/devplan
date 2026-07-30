// features/playersDatabase/ui/pages/searchPage/query/sx/searchModelsQuery.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchModelsQuerySx = {
  placeholder: {
    minHeight: 96,
    display: 'grid',
    placeItems: 'center',
    color: 'neutral.500',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.65,
  },

  card: {
    minWidth: 0,
    minHeight: 46,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 0.45,
    px: 0.6,
    pt: 0.65,
    pb: 0.1,
    borderRadius: 'sm',
    border: '1px solid',
    borderColor: 'neutral.200',
    bgcolor: '#fff',
    cursor: 'pointer',
    transition: '120ms ease',

    '&:hover': {
      borderColor: devPlanColors.tertiary,
      bgcolor: devPlanColors.tertiaryLight,
    },
  },

  cardSelected: {
    borderColor: devPlanColors.tertiary,
    bgcolor: devPlanColors.tertiaryLight,
  },

  cardDisabled: {
    opacity: 0.58,
    cursor: 'default',
  },

  checkbox: {
    mt: 0.15,
    ml: 0,
    flex: '0 0 auto',
  },

  cardContent: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 0.18,
  },

  description: {
    mt: 0.3,
    color: 'neutral.500',
    lineHeight: 1.12,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  teamContent: {
    minHeight: 0,
    height: '100%',
    pb: 0,
    overflow: 'hidden',
  },

  playerContent: {
    minHeight: 0,
    pb: 0,
  },

  tabs: {
    minHeight: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    bgcolor: 'transparent',
  },

  tabList: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    flex: '0 0 auto',
    gap: 0.5,
    p: 0.5,
    borderRadius: 'md',
    bgcolor: 'neutral.100',
  },

  tab: {
    minHeight: 34,
    px: 1,
    fontSize: 12,
    fontWeight: 600,
  },

  tabPanel: {
    minHeight: 0,
    flex: 1,
    px: 0,
    pt: 1,
    pb: 0.75,
    overflowX: 'hidden',
    overflowY: 'auto',
    scrollbarGutter: 'stable',
  },

  teamSidesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 1,

    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },

  teamSideSection: {
    minWidth: 0,
    px: 0.6,
    pt: 0.45,
    pb: 0.75,
    border: '1px solid',
    borderColor: 'neutral.200',
    borderRadius: 'md',
    bgcolor: 'neutral.100',
  },

  teamSideHeader: {
    minHeight: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    mb: 0.35,
  },

  teamSideTitle: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
  },

  sideResetButton: {
    minWidth: 24,
    minHeight: 24,
    p: 0.25,
    flex: '0 0 auto',
  },

  levelsGrid: {
    display: 'grid',
    pt: 0.55,
    gridTemplateColumns: '1fr',
    gap: 0.9,
  },
}
