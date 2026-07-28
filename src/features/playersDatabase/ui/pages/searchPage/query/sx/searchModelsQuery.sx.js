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
    gap: 0.75,
  },

  card: {
    minWidth: 0,
    minHeight: 62,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0.75,
    p: 0.75,
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
    flex: '0 0 auto',
  },

  cardContent: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 0.45,
  },

  description: {
    color: 'neutral.500',
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  teamContent: {
    minHeight: 0,
    height: '100%',
    pb: 0.25,
    overflow: 'hidden',
  },

  playerContent: {
    minHeight: 0,
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
    gap: 0.75,

    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },

  teamSideSection: {
    minWidth: 0,
    p: 0.75,
    border: '1px solid',
    borderColor: 'neutral.200',
    borderRadius: 'md',
    bgcolor: 'rgba(255,255,255,0.72)',
  },

  teamSideTitle: {
    display: 'inline-flex',
    mb: 0.75,
    color: devPlanColors.primaryDark,
  },

  resetButton: {
    position: 'sticky',
    bottom: 0,
    zIndex: 2,
    flex: '0 0 auto',
    mt: 0.75,
    width: '100%',
    minHeight: 30,
    borderTop: '1px solid',
    borderColor: 'neutral.200',
    borderRadius: 0,
    bgcolor: '#fff',
  },

  levelsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 0.6,
  },
}
