// features/playersDatabase/ui/components/tables/tables.layout.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const pdbTableLayoutSx = {
  wrap: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    bgcolor: '#fff',
  },

  splitWrap: {
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    overflow: 'hidden',
  },

  headerWrap: {
    minWidth: 0,
    overflow: 'hidden',
    borderBottom: '1px solid #dbe5f4',
  },

  bodyWrap: {
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
}
