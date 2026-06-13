// src/features/videoHub/components/filterRow.sx.js

import { getEntityColors } from '../../../../../ui/core/theme/Colors'
import { tabClasses } from '@mui/joy/Tab';

export const filterSx = {
  selectionToolbar: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    width: '100%',
    px: 1.25,
    py: 0.75,
    borderRadius: '12px',
    border: '1px solid',
    borderColor: 'danger.outlinedBorder',
    bgcolor: 'danger.softBg',
  },

  selectionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    color: 'danger.600',
  },

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
  },

  viewToggle: {
    minHeight: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    px: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '8px',
    bgcolor: 'background.surface',
    color: 'text.secondary',
  },

  viewToggleLabel: {
    fontWeight: 700,
    whiteSpace: 'nowrap',
  }
}
