
import { getEntityColors } from '../../../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

export const pageSx = {
  shell: (id) => ({
    minHeight: 0,
    minWidth: 0,
    height: '100%',
    overflow: 'hidden',
    borderRadius: 18,
    p: 1.25,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1,
    borderColor: 'rgba(15,23,42,0.08)',
    boxShadow: '0 8px 24px rgba(15,23,42,0.035)',
    bgcolor: c(id).bg
  }),

  gameRoot: {
    height: {
      xs: 'calc(100dvh - 24px)',
      md: 'calc(100dvh - 32px)',
    },
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1.25,
    pb: 6
  },

  gameWrap: {
    minHeight: 0,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1.5,
    flexShrink: 0,
  },

  entityGrid: {
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1,
  },
}
