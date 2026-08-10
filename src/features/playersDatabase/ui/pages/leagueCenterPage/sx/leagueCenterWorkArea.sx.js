// src/features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterWorkArea.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterWorkAreaSx = {
  workArea: {
    minHeight: 0,
    flex: 1,
    overflow: 'hidden',
  },

  sectionHeader: {
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  sectionTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  createButton: {
    minHeight: 30,
    px: 1.25,
    ml: 'auto',
    bgcolor: devPlanColors.tertiaryDark,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primary,
    },
  },

  taskList: {
    minHeight: 0,
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  taskItem: {
    width: '100%',
    minHeight: 86,
    p: 0.7,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 0.35,
    borderRadius: 8,
    border: `1px solid ${devPlanColors.border}`,
    bgcolor: devPlanColors.surface,
    color: devPlanColors.primaryDark,
    boxShadow: 'none',

    '&:hover': {
      borderColor: devPlanColors.tertiary,
    },
  },

  taskHeader: {
    minWidth: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    pb: 0.35,
    borderBottom: `1px solid ${devPlanColors.border}`,
  },

  taskHeaderActions: {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 0.3,
  },

  taskOpenButton: {
    minWidth: 0,
    width: '100%',
    minHeight: 30,
    p: 0.25,
    display: 'flex',
    justifyContent: 'flex-start',
    textAlign: 'left',
    color: devPlanColors.primaryDark,
    borderRadius: 7,

    '&:hover': {
      bgcolor: devPlanColors.tertiaryLight,
    },
  },

  taskTitle: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  taskMeta: {
    width: '100%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 0.2,
  },

  teamName: {
    flex: '0 1 auto',
    minWidth: 0,
    maxWidth: '38%',
    overflow: 'hidden',
    color: devPlanColors.primaryDark,
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.2,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  metaMainRow: {
    minWidth: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
    overflow: 'hidden',
  },

  metaSubRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
  },

  metaPrimary: {
    flex: '0 0 auto',
    color: devPlanColors.tertiaryDark,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  },

  metaSeparator: {
    flex: '0 0 auto',
    color: devPlanColors.secondary,
    lineHeight: 1.2,
  },

  leagueName: {
    flex: '1 1 auto',
    minWidth: 0,
    overflow: 'hidden',
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.2,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  metaText: {
    flex: '0 0 auto',
    color: devPlanColors.secondary,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  },

  statusChip: color => ({
    flex: '0 0 auto',
    '--Chip-minHeight': '21px',
    bgcolor: `${color}18`,
    color,
    fontWeight: 700,
  }),

  editButton: {
    minHeight: 23,
    px: 0.4,
    color: devPlanColors.tertiaryDark,
    fontSize: 12,
  },

  stateBox: {
    minHeight: 110,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },

  stateText: {
    color: devPlanColors.secondary,
  },

  emptyBox: {
    minHeight: 110,
    p: 1.25,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 0.35,
    borderRadius: 8,
    border: `1px dashed ${devPlanColors.border}`,
    bgcolor: devPlanColors.surface,
  },

  emptyTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 13,
    fontWeight: 700,
  },

  emptyCaption: {
    color: devPlanColors.secondary,
    lineHeight: 1.3,
  },
}
