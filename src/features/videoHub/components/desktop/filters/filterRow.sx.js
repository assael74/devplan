// src/features/videoHub/components/filterRow.sx.js

import { getEntityColors } from '../../../../../ui/core/theme/Colors'
import { tabClasses } from '@mui/joy/Tab';

export const filterSx = {
  filtersWrap: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  chipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
    p: 1
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
    width: '100%',
  },

  reset: {
    minWidth: 32,
    width: 32,
    height: 32,
    border: '1px solid',
    borderColor: 'divider',
    ml: 1
  }
}
