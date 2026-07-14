// src/features/reports/dashboard/components/sx/header.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const headerSx = {
  header: {
    position: 'relative',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'md',
    px: 2,
    py: 1.6,
  },

  headerInfo: {
    minWidth: 0,
    textAlign: 'right',
  },

  headerTitle: {
    m: 0,
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.15,
    color: 'text.primary',
  },

  headerSubtitle: {
    mt: 0.3,
    color: 'text.secondary',
    lineHeight: 1.25,
  },
}
