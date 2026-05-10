// playerProfile/desktop/modules/info/sx/targets.sx.js

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = (id) => getEntityColors(id)

export const targetsSx = {
  card: {
    p: 1.25,
    mt: 2,
    borderRadius: 'md',
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
    minHeight: 0,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: '1fr 3fr',
    },
    gap: 1.25,
    alignItems: 'start',
    minWidth: 0,
  },

  actualCol: {
    display: 'grid',
    gap: 0.75,
    p: 0.75,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    minWidth: 0,
  },

  targetsCol: {
    display: 'grid',
    gap: 1,
    alignContent: 'start',
    minWidth: 0,
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  actualBlock: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: '1fr 1fr 1fr',
    },
    gap: 0.5,
    p: 1,
    minWidth: 0,
  },

  actualBlockTitle: {
    fontWeight: 700,
    color: 'text.primary',
    pb: 0.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  actualMetric: (id) => ({
    p: 1,
    minHeight: 62,
    borderRadius: 'sm',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: c(id).bg,
    minWidth: 0,
    boxShadow: 'sm'
  }),

  actualMetricLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    mb: 0.15,
    lineHeight: 1.1,
  },

  actualMetricValue: {
    fontWeight: 700,
    lineHeight: 1.1,
  },
}
