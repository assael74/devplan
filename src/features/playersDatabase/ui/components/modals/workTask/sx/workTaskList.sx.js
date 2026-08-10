// src/features/playersDatabase/ui/components/modals/workTask/sx/workTaskList.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const workTaskListSx = {
  root: {
    minHeight: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.6,
    overflow: 'hidden',
  },

  header: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  titleRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
  },

  title: {
    color: devPlanColors.primaryDark,
    fontSize: 13,
    fontWeight: 700,
  },

  count: {
    '--Chip-minHeight': '20px',
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
    fontWeight: 700,
  },

  createButton: {
    minHeight: 30,
    px: 1.25,
    bgcolor: devPlanColors.tertiaryDark,
    color: '#fff',
    fontSize: 11.5,
    fontWeight: 700,

    '&:hover': {
      bgcolor: devPlanColors.primary,
    },
  },

  list: {
    minHeight: 0,
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    pr: 0.25,
  },

  item: {
    minWidth: 0,
    p: 0.65,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.35,
    borderRadius: 7,
    bgcolor: devPlanColors.surface,
    border: `1px solid ${devPlanColors.border}`,
  },

  itemTop: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
  },

  itemTitle: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize: 12.5,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  itemActions: {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 0.25,
  },

  statusChip: color => ({
    '--Chip-minHeight': '20px',
    bgcolor: `${color}18`,
    color,
    fontSize: 10.5,
    fontWeight: 700,
  }),

  editButton: {
    minHeight: 22,
    px: 0.25,
    color: devPlanColors.tertiaryDark,
    fontSize: 10.5,
  },

  itemMeta: {
    minWidth: 0,
    display: 'grid',
    gap: 0.2,
  },

  metaPrimaryRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    overflow: 'hidden',
  },

  metaSecondaryRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
  },

  metaLeague: {
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: devPlanColors.secondary,
    lineHeight: 1.2,
  },
  metaText: {
    color: devPlanColors.secondary,
    lineHeight: 1.2,
  },

  metaStrong: {
    color: devPlanColors.primary,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  state: {
    minHeight: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  empty: {
    minHeight: 56,
    px: 0.8,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 7,
    bgcolor: devPlanColors.secondaryLight,
    border: `1px dashed ${devPlanColors.border}`,
  },

  emptyText: {
    color: devPlanColors.secondary,
    lineHeight: 1.3,
  },
}
