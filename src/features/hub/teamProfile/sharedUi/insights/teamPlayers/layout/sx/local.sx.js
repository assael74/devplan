// teamProfile/sharedUi/insights/teamPlayers/layout/sx/LocalInsightsGroup.js

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

export const loaclSx = {
  root: {
    display: 'grid',
    alignContent: 'start',
    gridAutoRows: 'max-content',
    gap: 1.15,
    p: {
      xs: 1,
      md: 0.75,
    },
    borderRadius: 'xl',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  head: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    px: 0.25,
  },

  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.primary',
  },

  icon: (entity) => ({
    width: 30,
    height: 30,
    borderRadius: 'md',
    display: 'grid',
    border: '2px solid',
    borderColor: 'divider',
    placeItems: 'center',
    bgcolor: c(entity).bg,
    flex: '0 0 auto',
  }),
}
