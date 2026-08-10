// src/features/playersDatabase/ui/components/page/sx/pageSectionHeader.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const pageSectionHeaderSx = {
  header: {
    minWidth: 0,
    minHeight: 44,
    px: 1.25,
    py: 0.75,
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    bgcolor: '#dde9f0',
    borderBottom: '1px solid #c8d7e2',
  },

  soft: {
    minHeight: 48,
    px: 1.5,
    py: 1.05,
    borderBottomColor: '#c8d7e2',
    bgcolor: '#edf3f7',
  },

  textArea: {
    minWidth: 0,
  },

  endArea: {
    minWidth: 0,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
  },

  title: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  subtitle: {
    mt: 0.15,
    color: devPlanColors.secondary,
  },

  meta: {
    flexShrink: 0,
    px: 1,
    py: 0.25,
    borderRadius: 999,
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
    fontWeight: 700,
  },
}
