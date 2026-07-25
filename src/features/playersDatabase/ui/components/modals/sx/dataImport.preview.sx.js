// features/playersDatabase/ui/components/modals/sx/dataImport.preview.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const dataImportPreviewSx = {
  previewPanel: {
    minWidth: 0,
    minHeight: 0,
    p: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    overflow: 'hidden',
    borderRadius: 10,
    border: '1px solid #dbe5f4',
    boxShadow: 'none',
  },

  previewHeader: {
    minWidth: 0,
    px: 1,
    py: 0.85,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid #dbe5f4',
  },

  summaryChips: {
    flexShrink: 0,
    flexWrap: 'wrap',
  },
}
