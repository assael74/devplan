// src/features/playersDatabase/ui/pages/DataOpsPage/sx/focusedAuditFindings.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const focusedAuditFindingsSx = {
  tags: {
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  details: {
    minWidth: 0,
    borderTop: '1px solid',
    borderColor: devPlanColors.border,
    pt: 1,

    '& > summary': {
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 600,
      color: devPlanColors.primary,
      borderRadius: 'sm',

      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: devPlanColors.tertiary,
        outlineOffset: 3,
      },
    },
  },

  comparison: {
    mt: 1,
    display: 'grid',
    gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
    gap: 1,
  },

  value: {
    m: 0,
    mt: 0.5,
    p: 1,
    maxHeight: 260,
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    fontSize: 12,
    borderRadius: 'sm',
    bgcolor: devPlanColors.surface,
    color: devPlanColors.text,
  },

  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 0.75,
  },

  actionCopy: {
    minWidth: 0,
    flex: '1 1 220px',
    color: devPlanColors.subText,
  },

  scope: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    color: devPlanColors.subText,
    overflowWrap: 'anywhere',
  },

  dialog: {
    width: 540,
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100dvh - 32px)',
  },

  dialogContent: {
    gap: 1.25,
    overflowY: 'auto',
  },

  confirmationScope: {
    display: 'grid',
    gap: 0.5,
    p: 1.25,
    borderRadius: 'sm',
    bgcolor: devPlanColors.secondaryLight,
    overflowWrap: 'anywhere',
  },
}
