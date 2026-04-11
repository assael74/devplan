// features/home/sx/tasksFilters.sx.js

import { getEntityColors } from '../../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

export const filtersSx = {
  filtersBoxSx: {
    p: 0.5,
    borderRadius: 'xl',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    gap: 0.75,
    mt: 1.5
  },

  filtersTopRowSx: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    alignItems: 'center',
  },
}
